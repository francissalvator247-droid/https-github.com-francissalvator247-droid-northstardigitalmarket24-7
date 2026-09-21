// Centralized wallet configuration for deposits and recipient addresses.
// Can be customized via environment variable VITE_BTC_DEPOSIT_ADDRESS.
export const BTC_RECIPIENT_ADDRESS =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_BTC_DEPOSIT_ADDRESS) ||
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_BTC_RECIPIENT_ADDRESS) ||
  "1HcHj9MgJ7gKqTycGagzW2ZfkysuYrAVfB";
