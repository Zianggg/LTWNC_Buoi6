export interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  stock: number;
}

export interface CartTotals {
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
}
