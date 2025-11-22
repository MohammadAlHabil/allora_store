# Orders System — Allora Store

Comprehensive order management feature with best practices for performance, UX, and security.

Key Features

- Clean architecture with repository and service layers
- Server Actions for secure server-side operations
- Optimized database queries and pagination
- Filters for order status, payment status, and shipping status
- Order list and order details pages with responsive UI
- Cancellation flow with confirmation dialogs
- TypeScript types and Zod validation schemas
- React Query for caching and optimistic updates

Pages

- Orders list: `app/orders/page.tsx`
- Order details: `app/orders/[id]/page.tsx`

Components

- `OrderCard` — summary card for each order
- `OrderFilters` — sheet-based filtering UI
- `OrdersList` — manages fetching, pagination and rendering
- `OrderDetails` — full details view with items, shipping and billing
- `OrderItemsList` — list of items in an order
- `AddressCard` — address display component
- `StatusBadge` — visual badges for order/payment/shipping states

APIs / Actions

- `getUserOrdersAction` — fetch user orders
- `getOrderByIdAction` — fetch a specific order
- `cancelOrderAction` — cancel an order (with guards)

Performance & UX

- Server-side pagination and optimized SELECT queries
- Prefetch and caching with React Query
- Lazy-loaded images and components
- Loading and empty states designed for clarity

Security

- Session checks on actions
- Ownership checks for order detail access
- Proper validation and sanitized inputs

File structure

```
features/orders/
├── types/
├── validations/
├── repositories/
├── services/
├── actions/
├── hooks/
├── components/
└── index.ts
```

Testing / Usage

- Use `useOrders` and `useOrder` hooks for fetching
- Trigger cancel via `useCancelOrder` action
- Ensure database seeded with orders for testing

Future improvements

- Export orders as CSV/PDF
- Real-time shipment tracking
- Push notifications for order updates
- Re-order / quick-order features
