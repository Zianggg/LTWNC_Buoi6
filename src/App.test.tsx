import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { fetchProducts } from './features/products/api';
import { makeProduct, renderWithProviders } from './test/test-utils';

jest.mock('./features/products/api');
const mockFetch = fetchProducts as jest.MockedFunction<typeof fetchProducts>;

describe('Luồng mua hàng (integration)', () => {
  it('thêm sản phẩm từ danh sách → giỏ hàng cập nhật số lượng và tổng tiền', async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValue([
      makeProduct({ id: 'p1', name: 'Áo thun cotton', price: 199000 }),
      makeProduct({ id: 'p2', name: 'Giày sneaker', price: 899000, stock: 3 }),
    ]);
    renderWithProviders(<App />);

    const cart = screen.getByRole('complementary', { name: /giỏ hàng/i });
    expect(within(cart).getByText('Giỏ hàng trống.')).toBeInTheDocument();

    await user.click(await screen.findByRole('button', { name: 'Thêm Áo thun cotton vào giỏ' }));
    await user.click(screen.getByRole('button', { name: 'Thêm Áo thun cotton vào giỏ' }));

    expect(within(cart).getByLabelText('Số lượng Áo thun cotton')).toHaveValue(2);
    expect(within(cart).getByLabelText('Tổng cộng')).toHaveTextContent('428.000 đ');

    await user.click(screen.getByRole('button', { name: 'Thêm Giày sneaker vào giỏ' }));

    expect(within(cart).getAllByRole('listitem')).toHaveLength(2);
    expect(within(cart).getByText('Miễn phí')).toBeInTheDocument();
    expect(within(cart).getByLabelText('Tổng cộng')).toHaveTextContent('1.297.000 đ');
  });
});
