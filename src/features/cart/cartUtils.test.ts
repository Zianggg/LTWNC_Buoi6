import { makeCartItem } from '../../test/test-utils';
import {
  calcDiscount,
  calcShipping,
  calcSubtotal,
  calcTotalQuantity,
  calcTotals,
  formatVND,
  isValidCoupon,
  SHIPPING_FEE,
} from './cartUtils';

describe('calcSubtotal', () => {
  it('trả về 0 khi giỏ hàng rỗng', () => {
    expect(calcSubtotal([])).toBe(0);
  });

  it('cộng đúng giá × số lượng của nhiều sản phẩm', () => {
    const items = [
      makeCartItem({ id: 'a', price: 100000, qty: 2 }),
      makeCartItem({ id: 'b', price: 50000, qty: 3 }),
    ];
    expect(calcSubtotal(items)).toBe(350000);
  });
});

describe('calcTotalQuantity', () => {
  it('đếm tổng số lượng các sản phẩm trong giỏ', () => {
    const items = [makeCartItem({ id: 'a', qty: 2 }), makeCartItem({ id: 'b', qty: 4 })];
    expect(calcTotalQuantity(items)).toBe(6);
  });
});

describe('calcShipping', () => {
  it.each([
    [0, 0],
    [199000, SHIPPING_FEE],
    [499999, SHIPPING_FEE],
    [500000, 0],
    [1200000, 0],
  ])('tạm tính %i → phí vận chuyển %i', (subtotal, expected) => {
    expect(calcShipping(subtotal)).toBe(expected);
  });
});

describe('calcDiscount', () => {
  it('không có mã thì không giảm', () => {
    expect(calcDiscount(300000)).toBe(0);
    expect(calcDiscount(300000, null)).toBe(0);
  });

  it('mã GIAM10 giảm 10% tạm tính, không phân biệt hoa thường và khoảng trắng', () => {
    expect(calcDiscount(300000, ' giam10 ')).toBe(30000);
  });

  it('mã GIAM50K giảm 50.000 nhưng không vượt quá tạm tính', () => {
    expect(calcDiscount(300000, 'GIAM50K')).toBe(50000);
    expect(calcDiscount(30000, 'GIAM50K')).toBe(30000);
  });

  it('ném lỗi khi mã giảm giá không tồn tại', () => {
    expect(() => calcDiscount(300000, 'SAIMA')).toThrow('Mã giảm giá không hợp lệ');
  });
});

describe('isValidCoupon', () => {
  it('nhận diện mã hợp lệ và không hợp lệ', () => {
    expect(isValidCoupon('giam10')).toBe(true);
    expect(isValidCoupon('KHONGCO')).toBe(false);
  });
});

describe('calcTotals', () => {
  it('kết hợp tạm tính, giảm giá và phí vận chuyển', () => {
    const items = [makeCartItem({ price: 200000, qty: 2 })];
    expect(calcTotals(items, 'GIAM10')).toEqual({
      subtotal: 400000,
      discount: 40000,
      shipping: SHIPPING_FEE,
      total: 390000,
    });
  });
});

describe('formatVND', () => {
  it('định dạng tiền theo kiểu Việt Nam', () => {
    expect(formatVND(1250000)).toBe('1.250.000 đ');
  });
});
