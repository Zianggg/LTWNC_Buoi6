import { makeProduct } from '../../test/test-utils';
import { fetchProducts } from './api';

describe('fetchProducts', () => {
  const originalFetch = globalThis.fetch;
  const mockFetch = jest.fn();

  beforeEach(() => {
    globalThis.fetch = mockFetch as unknown as typeof fetch;
  });

  afterAll(() => {
    globalThis.fetch = originalFetch;
  });

  it('trả về danh sách sản phẩm khi API thành công', async () => {
    const products = [makeProduct()];
    mockFetch.mockResolvedValue({ ok: true, json: async () => products });

    await expect(fetchProducts()).resolves.toEqual(products);
    expect(mockFetch).toHaveBeenCalledWith('/products.json');
  });

  it('ném lỗi kèm mã HTTP khi API thất bại', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 500 });

    await expect(fetchProducts()).rejects.toThrow('HTTP 500');
  });
});
