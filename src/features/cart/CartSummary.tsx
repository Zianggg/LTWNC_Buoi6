import { useState, type FormEvent } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { Icon } from '../../components/Icon';
import {
  applyCoupon,
  clearCart,
  removeCoupon,
  removeItem,
  selectCartCount,
  selectCartItems,
  selectCartTotals,
  selectCoupon,
  updateQuantity,
} from './cartSlice';
import { CartItemRow } from './CartItemRow';
import { FREE_SHIPPING_THRESHOLD, formatVND, isValidCoupon } from './cartUtils';

export function CartSummary() {
  const items = useAppSelector(selectCartItems);
  const count = useAppSelector(selectCartCount);
  const coupon = useAppSelector(selectCoupon);
  const totals = useAppSelector(selectCartTotals);
  const dispatch = useAppDispatch();

  const [code, setCode] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);

  const submitCoupon = (e: FormEvent) => {
    e.preventDefault();
    if (!isValidCoupon(code)) {
      setCouponError('Mã giảm giá không hợp lệ');
      return;
    }
    dispatch(applyCoupon(code));
    setCode('');
    setCouponError(null);
  };

  const progress = Math.min(100, Math.round((totals.subtotal / FREE_SHIPPING_THRESHOLD) * 100));
  const remaining = FREE_SHIPPING_THRESHOLD - totals.subtotal;

  return (
    <aside className="cart" aria-labelledby="cart-title">
      <header className="cart__head">
        <h2 id="cart-title" className="heading">
          Giỏ hàng <span className="count-badge">{count}</span>
        </h2>
        {items.length > 0 && (
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => dispatch(clearCart())}>
            Xóa tất cả
          </button>
        )}
      </header>

      {items.length === 0 ? (
        <div className="empty">
          <Icon name="bag" size={40} />
          <p>Giỏ hàng trống.</p>
          <p className="caption muted">Bấm "Thêm vào giỏ" ở danh sách sản phẩm để bắt đầu.</p>
        </div>
      ) : (
        <>
          <ul className="cart__list" aria-label="Sản phẩm trong giỏ">
            {items.map((item) => (
              <CartItemRow
                key={item.id}
                item={item}
                onChangeQty={(id, qty) => dispatch(updateQuantity({ id, qty }))}
                onRemove={(id) => dispatch(removeItem(id))}
              />
            ))}
          </ul>

          <div className="shipping">
            <p className="caption shipping__text">
              <Icon name="truck" size={14} />
              {remaining > 0
                ? `Mua thêm ${formatVND(remaining)} để được miễn phí vận chuyển`
                : 'Đơn hàng được miễn phí vận chuyển'}
            </p>
            <div
              className="progress"
              role="progressbar"
              aria-label="Tiến độ miễn phí vận chuyển"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progress}
            >
              <div className="progress__fill" style={{ width: `${progress}%` }} />
            </div>
          </div>

          {coupon ? (
            <div className="coupon-applied">
              <span className="badge badge--success">
                <Icon name="check" size={12} /> Đã áp dụng {coupon}
              </span>
              <button type="button" className="btn btn--link" onClick={() => dispatch(removeCoupon())}>
                Bỏ mã
              </button>
            </div>
          ) : (
            <form className="coupon" onSubmit={submitCoupon} noValidate>
              <label htmlFor="coupon-input" className="field-label">
                Mã giảm giá
              </label>
              <div className="coupon__row">
                <input
                  id="coupon-input"
                  className="input"
                  value={code}
                  placeholder="VD: GIAM10"
                  aria-invalid={couponError ? true : undefined}
                  aria-describedby={couponError ? 'coupon-error' : undefined}
                  onChange={(e) => setCode(e.target.value)}
                />
                <button type="submit" className="btn btn--secondary">
                  Áp dụng
                </button>
              </div>
              {couponError && (
                <p id="coupon-error" className="field-error" role="alert">
                  {couponError}
                </p>
              )}
            </form>
          )}

          <dl className="totals">
            <div>
              <dt>Tạm tính</dt>
              <dd>{formatVND(totals.subtotal)}</dd>
            </div>
            {totals.discount > 0 && (
              <div>
                <dt>Giảm giá</dt>
                <dd className="text-success">−{formatVND(totals.discount)}</dd>
              </div>
            )}
            <div>
              <dt>Vận chuyển</dt>
              <dd>{totals.shipping === 0 ? 'Miễn phí' : formatVND(totals.shipping)}</dd>
            </div>
            <div className="totals__grand">
              <dt>Tổng cộng</dt>
              <dd aria-label="Tổng cộng">{formatVND(totals.total)}</dd>
            </div>
          </dl>

          <button type="button" className="btn btn--primary btn--block">
            Thanh toán
          </button>
        </>
      )}
    </aside>
  );
}
