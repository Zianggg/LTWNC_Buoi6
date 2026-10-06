import type { ReactElement } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { Provider } from 'react-redux';
import { setupStore, type AppStore, type RootState } from '../app/store';
import type { CartItem } from '../features/cart/types';
import type { Product } from '../features/products/types';

interface ExtendedRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  preloadedState?: Partial<RootState>;
  store?: AppStore;
}

/** Render component kèm Redux Provider; mỗi lần gọi tạo store MỚI để các test độc lập. */
export function renderWithProviders(
  ui: ReactElement,
  { preloadedState, store = setupStore(preloadedState), ...options }: ExtendedRenderOptions = {},
) {
  return {
    store,
    ...render(ui, {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
      ...options,
    }),
  };
}

export const makeProduct = (override: Partial<Product> = {}): Product => ({
  id: 'p1',
  name: 'Áo thun cotton',
  category: 'Áo',
  price: 199000,
  stock: 5,
  tag: 'blue',
  ...override,
});

export const makeCartItem = (override: Partial<CartItem> = {}): CartItem => ({
  id: 'p1',
  name: 'Áo thun cotton',
  price: 199000,
  qty: 1,
  stock: 5,
  ...override,
});
