import type { Product } from './types';

export async function fetchProducts(): Promise<Product[]> {
  const res = await fetch('/products.json');
  if (!res.ok) throw new Error(`Không tải được sản phẩm (HTTP ${res.status})`);
  return (await res.json()) as Product[];
}
