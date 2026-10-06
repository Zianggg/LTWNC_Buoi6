import { useState } from 'react';
import { Icon } from '../../components/Icon';
import { formatVND } from './cartUtils';
import type { CartItem } from './types';

interface CartItemRowProps {
  item: CartItem;
  onChangeQty: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
}

export function CartItemRow({ item, onChangeQty, onRemove }: CartItemRowProps) {
  // Cho phép ô tạm trống khi người dùng xoá để gõ số mới, thay vì hiểu nhầm là số lượng 0.
  const [isEmpty, setIsEmpty] = useState(false);

  const handleInput = (raw: string) => {
    setIsEmpty(raw === '');
    const qty = Number(raw);
    if (raw !== '' && Number.isFinite(qty) && qty >= 1) onChangeQty(item.id, qty);
  };

  return (
    <li className="cart-row">
      <div className="cart-row__info">
        <p className="cart-row__name">{item.name}</p>
        <p className="caption muted">{formatVND(item.price)}</p>
      </div>
      <div className="stepper">
        <button
          type="button"
          className="btn btn--icon"
          aria-label={`Giảm số lượng ${item.name}`}
          onClick={() => onChangeQty(item.id, item.qty - 1)}
        >
          <Icon name="minus" size={14} />
        </button>
        <input
          type="number"
          min={1}
          max={item.stock}
          aria-label={`Số lượng ${item.name}`}
          value={isEmpty ? '' : item.qty}
          onChange={(e) => handleInput(e.target.value)}
          onBlur={() => setIsEmpty(false)}
        />
        <button
          type="button"
          className="btn btn--icon"
          aria-label={`Tăng số lượng ${item.name}`}
          disabled={item.qty >= item.stock}
          onClick={() => onChangeQty(item.id, item.qty + 1)}
        >
          <Icon name="plus" size={14} />
        </button>
      </div>
      <p className="cart-row__line mono">{formatVND(item.price * item.qty)}</p>
      <button
        type="button"
        className="btn btn--icon btn--ghost-danger"
        aria-label={`Xóa ${item.name} khỏi giỏ`}
        onClick={() => onRemove(item.id)}
      >
        <Icon name="trash" size={16} />
      </button>
    </li>
  );
}
