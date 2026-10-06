import { Icon } from './components/Icon';
import { CartSummary } from './features/cart/CartSummary';
import { ProductList } from './features/products/ProductList';

export default function App() {
  return (
    <div className="app">
      <header className="topbar">
        <div className="logo">
          <span className="logo__mark">
            <Icon name="bag" size={18} />
          </span>
          <span className="title">Cửa hàng</span>
        </div>
        <span className="caption muted">LTWNC · Buổi 6 — Kiểm thử</span>
      </header>
      <main className="canvas">
        <ProductList />
        <CartSummary />
      </main>
    </div>
  );
}
