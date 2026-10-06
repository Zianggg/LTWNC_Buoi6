import { Icon } from '../../components/Icon';
import { formatVND } from '../cart/cartUtils';
import type { Product } from './types';

interface ProductCardProps {
  product: Product;
  onAdd: (product: Product) => void;
  /** Số lượng sản phẩm này đang có trong giỏ. */
  inCart?: number;
}

export function ProductCard({ product, onAdd, inCart = 0 }: ProductCardProps) {
  const outOfStock = product.stock <= 0;
  const reachedLimit = !outOfStock && inCart >= product.stock;
  const lowStock = !outOfStock && product.stock <= 3;

  return (
    <article className="product-card" aria-labelledby={`product-${product.id}`}>
      <div className="product-card__thumb" aria-hidden="true">
        <Icon name="box" size={28} />
      </div>
      <div className="product-card__tags">
        <span className={`tag tag--${product.tag ?? 'gray'}`}>{product.category}</span>
        {outOfStock ? (
          <span className="badge badge--danger">Hết hàng</span>
        ) : lowStock ? (
          <span className="badge badge--warning">Còn {product.stock}</span>
        ) : null}
      </div>
      <h3 id={`product-${product.id}`} className="product-card__name">
        {product.name}
      </h3>
      <p className="product-card__price">{formatVND(product.price)}</p>
      <div className="product-card__footer">
        {inCart > 0 && <span className="product-card__incart">Trong giỏ: {inCart}</span>}
        <button
          type="button"
          className="btn btn--primary btn--sm"
          disabled={outOfStock || reachedLimit}
          onClick={() => onAdd(product)}
          aria-label={`Thêm ${product.name} vào giỏ`}
        >
          <Icon name="plus" size={14} />
          {reachedLimit ? 'Đã đủ tồn kho' : 'Thêm vào giỏ'}
        </button>
      </div>
    </article>
  );
}
