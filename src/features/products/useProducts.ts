import { useCallback, useEffect, useState } from 'react';
import { fetchProducts } from './api';
import type { Product } from './types';

export type LoadStatus = 'loading' | 'success' | 'error';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    setError(null);
    fetchProducts()
      .then((data) => {
        if (cancelled) return;
        setProducts(data);
        setStatus('success');
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Đã có lỗi xảy ra');
        setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const reload = useCallback(() => setAttempt((n) => n + 1), []);

  return { products, status, error, reload };
}
