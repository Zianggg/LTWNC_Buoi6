import type { CartItem, CartTotals } from './types';

export const SHIPPING_FEE = 30000;
export const FREE_SHIPPING_THRESHOLD = 500000;

/** Mã giảm giá hợp lệ: `percent` tính theo %, `fixed` trừ thẳng số tiền. */
export const COUPONS: Record<string, { type: 'percent' | 'fixed'; value: number }> = {
  GIAM10: { type: 'percent', value: 10 },
  GIAM50K: { type: 'fixed', value: 50000 },
};

export function normalizeCoupon(code: string): string {
  return code.trim().toUpperCase();
}

export function isValidCoupon(code: string): boolean {
  return normalizeCoupon(code) in COUPONS;
}

export function calcSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.qty, 0);
}

export function calcTotalQuantity(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.qty, 0);
}

export function calcShipping(subtotal: number): number {
  if (subtotal <= 0 || subtotal >= FREE_SHIPPING_THRESHOLD) return 0;
  return SHIPPING_FEE;
}

/** Số tiền được giảm. Ném lỗi nếu mã không tồn tại; không bao giờ giảm quá tạm tính. */
export function calcDiscount(subtotal: number, code?: string | null): number {
  if (!code) return 0;
  const coupon = COUPONS[normalizeCoupon(code)];
  if (!coupon) throw new Error('Mã giảm giá không hợp lệ');
  const raw = coupon.type === 'percent' ? Math.round((subtotal * coupon.value) / 100) : coupon.value;
  return Math.min(raw, subtotal);
}

export function calcTotals(items: CartItem[], coupon?: string | null): CartTotals {
  const subtotal = calcSubtotal(items);
  const discount = calcDiscount(subtotal, coupon);
  const shipping = calcShipping(subtotal);
  return { subtotal, discount, shipping, total: subtotal - discount + shipping };
}

export function formatVND(amount: number): string {
  return `${amount.toLocaleString('vi-VN')} đ`;
}
