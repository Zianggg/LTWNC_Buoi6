import { act, renderHook, waitFor } from '@testing-library/react';
import { makeProduct } from '../../test/test-utils';
import { fetchProducts } from './api';
import { useProducts } from './useProducts';

jest.mock('./api');
const mockFetch = fetchProducts as jest.MockedFunction<typeof fetchProducts>;

describe('useProducts', () => {
  it('chuyển từ loading sang success khi API trả dữ liệu', async () => {
    mockFetch.mockResolvedValue([makeProduct()]);

    const { result } = renderHook(() => useProducts());
    expect(result.current.status).toBe('loading');

    await waitFor(() => expect(result.current.status).toBe('success'));
    expect(result.current.products).toEqual([makeProduct()]);
    expect(result.current.error).toBeNull();
  });

  it('chuyển sang error và giữ thông báo lỗi khi API thất bại', async () => {
    mockFetch.mockRejectedValue(new Error('HTTP 500'));

    const { result } = renderHook(() => useProducts());

    await waitFor(() => expect(result.current.status).toBe('error'));
    expect(result.current.error).toBe('HTTP 500');
  });

  it('dùng thông báo mặc định khi lỗi không phải Error', async () => {
    mockFetch.mockRejectedValue('timeout');

    const { result } = renderHook(() => useProducts());

    await waitFor(() => expect(result.current.error).toBe('Đã có lỗi xảy ra'));
  });

  it('reload gọi lại API và cập nhật dữ liệu mới', async () => {
    mockFetch.mockRejectedValueOnce(new Error('mất mạng'));
    mockFetch.mockResolvedValueOnce([makeProduct({ name: 'Quần jean' })]);

    const { result } = renderHook(() => useProducts());
    await waitFor(() => expect(result.current.status).toBe('error'));

    act(() => result.current.reload());

    await waitFor(() => expect(result.current.status).toBe('success'));
    expect(result.current.products[0].name).toBe('Quần jean');
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });
});
