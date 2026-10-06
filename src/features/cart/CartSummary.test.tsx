import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { makeCartItem, renderWithProviders } from '../../test/test-utils';
import { CartSummary } from './CartSummary';

const twoItems = {
  cart: {
    items: [
      makeCartItem({ id: 'a', name: 'Áo thun cotton', price: 199000, qty: 1, stock: 5 }),
      makeCartItem({ id: 'b', name: 'Quần jean slim', price: 100000, qty: 1, stock: 2 }),
    ],
    coupon: null,
  },
};

describe('<CartSummary />', () => {
  it('hiển thị trạng thái trống khi chưa có sản phẩm', () => {
    renderWithProviders(<CartSummary />);

    expect(screen.getByText('Giỏ hàng trống.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Thanh toán' })).not.toBeInTheDocument();
  });

  it('hiển thị danh sách và tổng tiền có phí vận chuyển', () => {
    renderWithProviders(<CartSummary />, { preloadedState: twoItems });

    const list = screen.getByRole('list', { name: 'Sản phẩm trong giỏ' });
    expect(within(list).getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByText('299.000 đ')).toBeInTheDocument(); // tạm tính
    expect(screen.getByText('30.000 đ')).toBeInTheDocument(); // phí ship
    expect(screen.getByLabelText('Tổng cộng')).toHaveTextContent('329.000 đ');
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '60');
  });

  it('tăng số lượng cập nhật tổng tiền và khoá nút khi đạt tồn kho', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CartSummary />, { preloadedState: twoItems });

    const increase = screen.getByRole('button', { name: 'Tăng số lượng Quần jean slim' });
    await user.click(increase);

    expect(screen.getByLabelText('Số lượng Quần jean slim')).toHaveValue(2);
    expect(increase).toBeDisabled();
    expect(screen.getByLabelText('Tổng cộng')).toHaveTextContent('429.000 đ');
  });

  it('giảm về 0 hoặc bấm xoá sẽ bỏ sản phẩm khỏi giỏ', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CartSummary />, { preloadedState: twoItems });

    await user.click(screen.getByRole('button', { name: 'Giảm số lượng Áo thun cotton' }));
    expect(screen.queryByText('Áo thun cotton')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Xóa Quần jean slim khỏi giỏ' }));
    expect(screen.getByText('Giỏ hàng trống.')).toBeInTheDocument();
  });

  it('nhập số lượng trực tiếp vào ô số lượng', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CartSummary />, { preloadedState: twoItems });

    const input = screen.getByLabelText('Số lượng Áo thun cotton');
    await user.clear(input);
    await user.type(input, '3');

    expect(input).toHaveValue(3);
    expect(screen.getByLabelText('Tổng cộng')).toHaveTextContent('697.000 đ');
  });

  it('xoá trắng ô số lượng không làm mất sản phẩm, rời ô thì hiện lại số cũ', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CartSummary />, { preloadedState: twoItems });

    const input = screen.getByLabelText('Số lượng Áo thun cotton');
    await user.clear(input);
    expect(screen.getByText('Áo thun cotton')).toBeInTheDocument();

    await user.tab();
    expect(input).toHaveValue(1);
  });

  it('báo lỗi khi nhập mã giảm giá không hợp lệ', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CartSummary />, { preloadedState: twoItems });

    await user.type(screen.getByLabelText('Mã giảm giá'), 'SAIMA');
    await user.click(screen.getByRole('button', { name: 'Áp dụng' }));

    expect(screen.getByRole('alert')).toHaveTextContent('Mã giảm giá không hợp lệ');
    expect(screen.getByLabelText('Mã giảm giá')).toHaveAttribute('aria-invalid', 'true');
  });

  it('áp dụng mã hợp lệ thì hiện dòng giảm giá, bỏ mã thì trở lại như cũ', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CartSummary />, { preloadedState: twoItems });

    await user.type(screen.getByLabelText('Mã giảm giá'), 'giam50k');
    await user.click(screen.getByRole('button', { name: 'Áp dụng' }));

    expect(screen.getByText(/Đã áp dụng GIAM50K/)).toBeInTheDocument();
    expect(screen.getByText('−50.000 đ')).toBeInTheDocument();
    expect(screen.getByLabelText('Tổng cộng')).toHaveTextContent('279.000 đ');

    await user.click(screen.getByRole('button', { name: 'Bỏ mã' }));
    expect(screen.getByLabelText('Mã giảm giá')).toBeInTheDocument();
    expect(screen.getByLabelText('Tổng cộng')).toHaveTextContent('329.000 đ');
  });

  it('miễn phí vận chuyển khi tạm tính đạt ngưỡng', () => {
    renderWithProviders(<CartSummary />, {
      preloadedState: { cart: { items: [makeCartItem({ price: 500000 })], coupon: null } },
    });

    expect(screen.getByText('Miễn phí')).toBeInTheDocument();
    expect(screen.getByText('Đơn hàng được miễn phí vận chuyển')).toBeInTheDocument();
  });

  it('"Xóa tất cả" làm rỗng giỏ hàng', async () => {
    const user = userEvent.setup();
    const { store } = renderWithProviders(<CartSummary />, { preloadedState: twoItems });

    await user.click(screen.getByRole('button', { name: 'Xóa tất cả' }));

    expect(screen.getByText('Giỏ hàng trống.')).toBeInTheDocument();
    expect(store.getState().cart.items).toHaveLength(0);
  });
});
