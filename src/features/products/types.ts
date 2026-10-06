export type TagColor = 'purple' | 'pink' | 'blue' | 'orange' | 'green' | 'teal' | 'yellow' | 'gray';

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  tag?: TagColor;
}
