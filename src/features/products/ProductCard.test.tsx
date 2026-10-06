import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { makeProduct } from '../../test/test-utils';
import { ProductCard } from './ProductCard';

describe('<ProductCard />', () => {
  it('hiển thị tên, danh mục và giá sản phẩm', () => {
    render(<ProductCard product={makeProduct()} onAdd={jest.fn()} />);

    expect(screen.getByRole('heading', { name: 'Áo thun cotton' })).toBeInTheDocument();
    expect(screen.getByText('Áo')).toBeInTheDocument();
    expect(screen.getByText('199.000 đ')).toBeInTheDocument();
  });

  it('bấm "Thêm vào giỏ" gọi onAdd với đúng sản phẩm', async () => {
    const user = userEvent.setup();
    const onAdd = jest.fn();
    const product = makeProduct();
    render(<ProductCard product={product} onAdd={onAdd} />);

    await user.click(screen.getByRole('button', { name: 'Thêm Áo thun cotton vào giỏ' }));

    expect(onAdd).toHaveBeenCalledTimes(1);
    expect(onAdd).toHaveBeenCalledWith(product);
  });

  it('vô hiệu hoá nút và hiện nhãn "Hết hàng" khi hết hàng', () => {
    render(<ProductCard product={makeProduct({ stock: 0 })} onAdd={jest.fn()} />);

    expect(screen.getByRole('button', { name: /thêm áo thun cotton/i })).toBeDisabled();
    expect(screen.getByText('Hết hàng')).toBeInTheDocument();
  });

  it('cảnh báo sắp hết hàng khi tồn kho ≤ 3', () => {
    render(<ProductCard product={makeProduct({ stock: 2 })} onAdd={jest.fn()} />);

    expect(screen.getByText('Còn 2')).toBeInTheDocument();
  });

  it('khoá nút khi số lượng trong giỏ đã bằng tồn kho', () => {
    render(<ProductCard product={makeProduct({ stock: 2 })} inCart={2} onAdd={jest.fn()} />);

    const button = screen.getByRole('button', { name: /thêm áo thun cotton/i });
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent('Đã đủ tồn kho');
    expect(screen.getByText('Trong giỏ: 2')).toBeInTheDocument();
  });
});
