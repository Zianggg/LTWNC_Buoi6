# LTWNC — Bài tập tuần 6: Kiểm thử Frontend

Bộ test Jest + React Testing Library cho **module giỏ hàng/sản phẩm** (React 19 + TypeScript + Redux Toolkit). Giao diện dùng token trong `DESIGN_SYSTEM.md`.

## Chạy

```bash
npm install
npm test               # chạy toàn bộ test
npm run coverage       # jest --coverage (ngưỡng 70% cấu hình trong jest.config.ts)
npm run dev            # chạy app tại http://localhost:5173
```

Báo cáo HTML sinh ra ở `coverage/index.html`.

## Kết quả

| Chỉ số | Kết quả | Yêu cầu |
| --- | --- | --- |
| Số test | **61 test / 9 file**, tất cả pass | ≥ 10 |
| Statements | 98.96% | ≥ 70% |
| Branches | 95.5% | ≥ 70% |
| Functions | 100% | ≥ 70% |
| Lines | 100% | ≥ 70% |

Ảnh báo cáo nằm trong thư mục [`bao-cao/`](bao-cao/):

- `3-coverage-summary.png`: bảng coverage từ `jest --coverage`
- `2-coverage-html-report.png`: báo cáo HTML của Istanbul
- `1-ket-qua-test-terminal.png`: danh sách đầy đủ 61 test
- `4-giao-dien.png`: giao diện module

## Cấu trúc module

```
src/
├── app/store.ts, hooks.ts           # Redux store (setupStore nhận preloadedState)
├── hooks/useDebounce.ts             # hook dùng chung
├── features/cart/
│   ├── cartUtils.ts                 # hàm thuần: tạm tính, phí ship, mã giảm giá, định dạng tiền
│   ├── cartSlice.ts                 # reducer + selector
│   ├── CartSummary.tsx, CartItemRow.tsx
├── features/products/
│   ├── api.ts                       # fetchProducts (gọi /products.json)
│   ├── useProducts.ts               # hook tải dữ liệu: loading / success / error / reload
│   ├── ProductCard.tsx, ProductList.tsx
└── test/test-utils.tsx              # renderWithProviders, makeProduct, makeCartItem
```

## Bộ test

| File | Loại | Nội dung chính |
| --- | --- | --- |
| `cartUtils.test.ts` | Unit (hàm) | giỏ rỗng, nhiều sản phẩm, ngưỡng phí ship (`it.each`), mã giảm giá hợp lệ/không hợp lệ (`toThrow`), tổng hợp |
| `cartSlice.test.ts` | Unit (reducer) | addItem (mới / trùng / vượt tồn kho / hết hàng), removeItem và updateQuantity với id không tồn tại, coupon, clearCart, selector |
| `useDebounce.test.ts` | Unit (hook) | `renderHook` + `jest.useFakeTimers` + `advanceTimersByTime` |
| `useProducts.test.ts` | Unit (hook, **async**) | `jest.mock('./api')`: loading → success, error, reload |
| `api.test.ts` | Unit (**async**) | mock `fetch`: thành công, lỗi HTTP 500 |
| `ProductCard.test.tsx` | Integration (RTL) | hiển thị, `userEvent.click` gọi `onAdd`, disabled khi hết hàng hoặc đã đủ tồn kho |
| `CartSummary.test.tsx` | Integration (RTL + Redux) | trống, tổng tiền, tăng/giảm/nhập số lượng, xoá, mã giảm giá, miễn phí ship, xoá tất cả |
| `ProductList.test.tsx` | Integration (**async**, API mock) | đang tải → danh sách, lỗi → "Thử lại", tìm kiếm có debounce, thêm vào giỏ cập nhật store |
| `App.test.tsx` | Integration (luồng) | thêm sản phẩm từ danh sách → giỏ cập nhật số lượng và tổng tiền |

Các nguyên tắc áp dụng theo bài giảng:

- Truy vấn ưu tiên `getByRole` / `getByLabelText`; không dùng `getByTestId`.
- Test hành vi người dùng, không đọc state nội bộ của component.
- Mỗi test tạo store mới qua `renderWithProviders`; `clearMocks: true` để các test độc lập.
- Bất đồng bộ dùng `findBy` / `waitFor`, không `sleep` thủ công.

## Lỗi test phát hiện được

Khi viết test "nhập số lượng trực tiếp", test phát hiện lỗi: xoá trắng ô số lượng để gõ lại thì `Number('')` = 0, nên sản phẩm bị xoá khỏi giỏ. Đã sửa `CartItemRow` để cho phép ô tạm trống và bỏ qua giá trị < 1. Test `xoá trắng ô số lượng không làm mất sản phẩm` giữ cho lỗi này không quay lại.
