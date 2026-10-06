import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { makeProduct, renderWithProviders } from '../../test/test-utils';
import { fetchProducts } from './api';
import { ProductList } from './ProductList';

jest.mock('./api');
const mockFetch = fetchProducts as jest.MockedFunction<typeof fetchProducts>;

const products = [
  makeProduct({ id: 'p1', name: 'Áo thun cotton' }),
  makeProduct({ id: 'p2', name: 'Quần jean slim', price: 459000 }),
  makeProduct({ id: 'p3', name: 'Mũ lưỡi trai', stock: 0 }),
];

describe('<ProductList /> — bất đồng bộ với API được mock', () => {
  it('hiển thị trạng thái đang tải rồi danh sách sản phẩm', async () => {
    mockFetch.mockResolvedValue(products);
    renderWithProviders(<ProductList />);

    expect(screen.getByRole('status')).toHaveTextContent('Đang tải sản phẩm...');

    expect(await screen.findByRole('heading', { name: 'Áo thun cotton' })).toBeInTheDocument();
    expect(screen.getAllByRole('article')).toHaveLength(3);
    expect(screen.getByText('3 sản phẩm')).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('hiển thị lỗi khi API thất bại và tải lại được khi bấm "Thử lại"', async () => {
    const user = userEvent.setup();
    mockFetch.mockRejectedValueOnce(new Error('Không tải được sản phẩm (HTTP 500)'));
    mockFetch.mockResolvedValueOnce(products);
    renderWithProviders(<ProductList />);

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('HTTP 500');

    await user.click(screen.getByRole('button', { name: 'Thử lại' }));

    expect(await screen.findByRole('heading', { name: 'Quần jean slim' })).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('lọc sản phẩm theo từ khoá sau khi debounce', async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValue(products);
    renderWithProviders(<ProductList />);
    await screen.findByRole('heading', { name: 'Áo thun cotton' });

    await user.type(screen.getByRole('searchbox', { name: 'Tìm sản phẩm' }), 'jean');

    await waitFor(() => expect(screen.getAllByRole('article')).toHaveLength(1));
    expect(screen.getByRole('heading', { name: 'Quần jean slim' })).toBeInTheDocument();
  });

  it('hiện thông báo khi không có sản phẩm khớp từ khoá', async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValue(products);
    renderWithProviders(<ProductList />);
    await screen.findByRole('heading', { name: 'Áo thun cotton' });

    await user.type(screen.getByRole('searchbox', { name: 'Tìm sản phẩm' }), 'xyz');

    expect(await screen.findByText('Không tìm thấy sản phẩm phù hợp.')).toBeInTheDocument();
  });

  it('bấm "Thêm vào giỏ" cập nhật Redux store', async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValue(products);
    const { store } = renderWithProviders(<ProductList />);

    await user.click(
      await screen.findByRole('button', { name: 'Thêm Áo thun cotton vào giỏ' }),
    );

    expect(store.getState().cart.items).toEqual([
      expect.objectContaining({ id: 'p1', qty: 1 }),
    ]);
    expect(screen.getByText('Trong giỏ: 1')).toBeInTheDocument();
  });
});
