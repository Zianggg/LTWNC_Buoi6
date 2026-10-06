import { createSelector, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Product } from '../products/types';
import type { CartItem } from './types';
import { calcTotalQuantity, calcTotals, isValidCoupon, normalizeCoupon } from './cartUtils';

export interface CartState {
  items: CartItem[];
  coupon: string | null;
}

export const initialCartState: CartState = { items: [], coupon: null };

const cartSlice = createSlice({
  name: 'cart',
  initialState: initialCartState,
  reducers: {
    addItem(state, action: PayloadAction<Product>) {
      const product = action.payload;
      if (product.stock <= 0) return;
      const existing = state.items.find((i) => i.id === product.id);
      if (existing) {
        existing.qty = Math.min(existing.qty + 1, existing.stock);
        return;
      }
      state.items.push({
        id: product.id,
        name: product.name,
        price: product.price,
        stock: product.stock,
        qty: 1,
      });
    },
    removeItem(state, action: PayloadAction<string>) {
      state.items = state.items.filter((i) => i.id !== action.payload);
    },
    updateQuantity(state, action: PayloadAction<{ id: string; qty: number }>) {
      const { id, qty } = action.payload;
      const item = state.items.find((i) => i.id === id);
      if (!item) return;
      if (qty <= 0) {
        state.items = state.items.filter((i) => i.id !== id);
        return;
      }
      item.qty = Math.min(Math.floor(qty), item.stock);
    },
    applyCoupon(state, action: PayloadAction<string>) {
      if (isValidCoupon(action.payload)) state.coupon = normalizeCoupon(action.payload);
    },
    removeCoupon(state) {
      state.coupon = null;
    },
    clearCart() {
      return initialCartState;
    },
  },
});

export const { addItem, removeItem, updateQuantity, applyCoupon, removeCoupon, clearCart } =
  cartSlice.actions;
export default cartSlice.reducer;

type StateWithCart = { cart: CartState };

export const selectCartItems = (state: StateWithCart) => state.cart.items;
export const selectCoupon = (state: StateWithCart) => state.cart.coupon;
export const selectCartCount = createSelector(selectCartItems, calcTotalQuantity);
export const selectCartTotals = createSelector(selectCartItems, selectCoupon, calcTotals);
