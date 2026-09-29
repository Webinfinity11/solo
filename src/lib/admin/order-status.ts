// Shared by the admin orders list (client) and the server actions.
export const ORDER_STATUSES = ["new", "paid", "shipped", "completed", "cancelled"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];
