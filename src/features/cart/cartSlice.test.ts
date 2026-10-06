import { makeCartItem, makeProduct } from '../../test/test-utils';
import cartReducer, {
  addItem,
  applyCoupon,
  clearCart,
  initialCartState,
  removeCoupon,
  removeItem,
  selectCartCount,
  selectCartTotals,
  updateQuantity,
  type CartState,
} from './cartSlice';

const withItems = (...items: ReturnType<typeof makeCartItem>[]): CartState => ({
  ...initialCartState,
  items,
});

describe('cartSlice reducer', () => {
  it('trả về state ban đầu khi gặp action không xác định', () => {
    expect(cartReducer(undefined, { type: 'unknown' })).toEqual(initialCartState);
  });

  describe('addItem', () => {
    it('thêm sản phẩm mới vào giỏ với số lượng 1', () => {
      const state = cartReducer(initialCartState, addItem(makeProduct()));
      expect(state.items).toEqual([makeCartItem({ qty: 1 })]);
    });

    it('thêm trùng sản phẩm thì tăng số lượng thay vì thêm dòng mới', () => {
      const state = cartReducer(withItems(makeCartItem({ qty: 1 })), addItem(makeProduct()));
      expect(state.items).toHaveLength(1);
      expect(state.items[0].qty).toBe(2);
    });

    it('không cho vượt quá tồn kho', () => {
      const start = withItems(makeCartItem({ qty: 5, stock: 5 }));
      const state = cartReducer(start, addItem(makeProduct({ stock: 5 })));
      expect(state.items[0].qty).toBe(5);
    });

    it('bỏ qua sản phẩm đã hết hàng', () => {
      const state = cartReducer(initialCartState, addItem(makeProduct({ stock: 0 })));
      expect(state).toEqual(initialCartState);
    });
  });

  describe('removeItem', () => {
    it('xoá sản phẩm theo id', () => {
      const start = withItems(makeCartItem({ id: 'a' }), makeCartItem({ id: 'b' }));
      const state = cartReducer(start, removeItem('a'));
      expect(state.items.map((i) => i.id)).toEqual(['b']);
    });

    it('bỏ qua id không tồn tại', () => {
      const start = withItems(makeCartItem());
      expect(cartReducer(start, removeItem('x'))).toEqual(start);
    });
  });

  describe('updateQuantity', () => {
    it('cập nhật số lượng mới', () => {
      const state = cartReducer(withItems(makeCartItem()), updateQuantity({ id: 'p1', qty: 3 }));
      expect(state.items[0].qty).toBe(3);
    });

    it('giới hạn số lượng ở mức tồn kho', () => {
      const state = cartReducer(
        withItems(makeCartItem({ stock: 4 })),
        updateQuantity({ id: 'p1', qty: 99 }),
      );
      expect(state.items[0].qty).toBe(4);
    });

    it('số lượng ≤ 0 thì xoá sản phẩm khỏi giỏ', () => {
      const state = cartReducer(withItems(makeCartItem()), updateQuantity({ id: 'p1', qty: 0 }));
      expect(state.items).toHaveLength(0);
    });

    it('bỏ qua id không tồn tại', () => {
      const start = withItems(makeCartItem());
      expect(cartReducer(start, updateQuantity({ id: 'x', qty: 2 }))).toEqual(start);
    });
  });

  describe('coupon', () => {
    it('applyCoupon lưu mã hợp lệ dưới dạng chữ hoa', () => {
      expect(cartReducer(initialCartState, applyCoupon('giam10')).coupon).toBe('GIAM10');
    });

    it('applyCoupon bỏ qua mã không hợp lệ', () => {
      expect(cartReducer(initialCartState, applyCoupon('SAIMA')).coupon).toBeNull();
    });

    it('removeCoupon gỡ mã đang áp dụng', () => {
      const state = cartReducer({ ...initialCartState, coupon: 'GIAM10' }, removeCoupon());
      expect(state.coupon).toBeNull();
    });
  });

  it('clearCart đưa giỏ hàng về trạng thái rỗng', () => {
    const start: CartState = { items: [makeCartItem()], coupon: 'GIAM10' };
    expect(cartReducer(start, clearCart())).toEqual(initialCartState);
  });
});

describe('cart selectors', () => {
  it('tính tổng số lượng và tổng tiền từ state', () => {
    const cart: CartState = {
      items: [makeCartItem({ id: 'a', price: 300000, qty: 2 })],
      coupon: 'GIAM50K',
    };
    expect(selectCartCount({ cart })).toBe(2);
    expect(selectCartTotals({ cart })).toEqual({
      subtotal: 600000,
      discount: 50000,
      shipping: 0,
      total: 550000,
    });
  });
});
