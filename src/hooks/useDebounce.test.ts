import { act, renderHook } from '@testing-library/react';
import { useDebounce } from './useDebounce';

describe('useDebounce', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('trả về giá trị ban đầu ngay lập tức', () => {
    const { result } = renderHook(() => useDebounce('áo', 300));
    expect(result.current).toBe('áo');
  });

  it('chỉ cập nhật giá trị sau khi hết thời gian chờ', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: 'á' },
    });

    rerender({ value: 'áo' });
    act(() => jest.advanceTimersByTime(299));
    expect(result.current).toBe('á');

    act(() => jest.advanceTimersByTime(1));
    expect(result.current).toBe('áo');
  });

  it('gõ liên tục thì chỉ lấy giá trị cuối cùng', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: '' },
    });

    rerender({ value: 'g' });
    act(() => jest.advanceTimersByTime(200));
    rerender({ value: 'gi' });
    act(() => jest.advanceTimersByTime(200));
    rerender({ value: 'gia' });
    expect(result.current).toBe('');

    act(() => jest.advanceTimersByTime(300));
    expect(result.current).toBe('gia');
  });
});
