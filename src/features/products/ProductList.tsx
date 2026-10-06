import { useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { Icon } from '../../components/Icon';
import { useDebounce } from '../../hooks/useDebounce';
import { addItem, selectCartItems } from '../cart/cartSlice';
import { ProductCard } from './ProductCard';
import { useProducts } from './useProducts';

export function ProductList() {
  const { products, status, error, reload } = useProducts();
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  const cartItems = useAppSelector(selectCartItems);
  const dispatch = useAppDispatch();

  const visible = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => p.name.toLowerCase().includes(q));
  }, [products, debouncedQuery]);

  const qtyInCart = (id: string) => cartItems.find((i) => i.id === id)?.qty ?? 0;

  return (
    <section className="products" aria-labelledby="products-title">
      <div className="section-head">
        <div>
          <h2 id="products-title" className="title">
            Sản phẩm
          </h2>
          {status === 'success' && <p className="caption muted">{visible.length} sản phẩm</p>}
        </div>
        <label className="search">
          <span className="sr-only">Tìm sản phẩm</span>
          <Icon name="search" />
          <input
            type="search"
            placeholder="Tìm sản phẩm…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
      </div>

      {status === 'loading' && (
        <div role="status" className="grid">
          <span className="sr-only">Đang tải sản phẩm...</span>
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="skeleton-card" aria-hidden="true" />
          ))}
        </div>
      )}

      {status === 'error' && (
        <div role="alert" className="alert alert--danger">
          <Icon name="alert" size={18} />
          <div className="alert__body">
            <p className="alert__title">Không tải được danh sách sản phẩm</p>
            <p className="caption">{error}</p>
          </div>
          <button type="button" className="btn btn--secondary btn--sm" onClick={reload}>
            Thử lại
          </button>
        </div>
      )}

      {status === 'success' && visible.length === 0 && (
        <div className="empty">
          <Icon name="search" size={40} />
          <p>Không tìm thấy sản phẩm phù hợp.</p>
        </div>
      )}

      {status === 'success' && visible.length > 0 && (
        <div className="grid">
          {visible.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              inCart={qtyInCart(p.id)}
              onAdd={(product) => dispatch(addItem(product))}
            />
          ))}
        </div>
      )}
    </section>
  );
}
