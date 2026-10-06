import { combineReducers, configureStore } from '@reduxjs/toolkit';
import cartReducer from '../features/cart/cartSlice';

export const rootReducer = combineReducers({ cart: cartReducer });

export type RootState = ReturnType<typeof rootReducer>;

export function setupStore(preloadedState?: Partial<RootState>) {
  return configureStore({ reducer: rootReducer, preloadedState });
}

export type AppStore = ReturnType<typeof setupStore>;
export type AppDispatch = AppStore['dispatch'];
