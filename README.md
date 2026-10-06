# StreamPass Merchant Admin Console & Voucher Liquidation Portal

A dedicated, standalone admin console for managing StreamPass client subscriptions, reviewing Myntra & Amazon gift vouchers, updating order statuses (Approved / Rejected / Pending), generating custom WhatsApp dispatch links, and exporting CSV reports.

## 🚀 Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Admin Console**:
   ```bash
   npm run dev
   ```

3. **Production Build**:
   ```bash
   npm run build
   ```

## ⚡ Key Features
- **Live Metrics Dashboard**: Real-time sales volume, Myntra face value, Amazon claim value, pending orders count.
- **Voucher Liquidation Desk**: 1-click copy buttons for 16-Digit Card No, PIN, Expiry, Selling Price calculation.
- **Status Selector**:
  - `Pending Review`
  - `Approved` (Auto-generates credentials dispatch WhatsApp link)
  - `Rejected` (Prompts for custom rejection reason & notifies client)
- **CSV Export**: 1-click order database export to Excel/CSV.
- **Multi-Tab Live Sync**: Utilizes `localStorage` broadcast to update client storefront instantly.
