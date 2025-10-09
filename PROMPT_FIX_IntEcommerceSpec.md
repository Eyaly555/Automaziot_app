# Fix Service Component: E-commerce Platform Integration

## What You Need To Do

**Simple job:** Replace the simplified interface with the FULL TypeScript interface from the codebase.

## Service Details
- **Service ID:** `int-ecommerce`
- **Service Number:** #37
- **Service Name (Hebrew):** אינטגרציית חנות אונלין
- **Category:** Integrations → saves to `implementationSpec.integrationServices`
- **Current Coverage:** ~10% (5 out of 60+ fields)
- **Target Coverage:** 95%+ (55+ fields)

## Files To Read

### 1. TypeScript Interface
**File:** `discovery-assistant/src/types/integrationServices.ts`
**Line:** 1223
**Search for:** `export interface IntEcommerceRequirements`
**Action:** Read lines 1223-1400+ completely. E-commerce integration interface.

**Key sections:**
- `ecommercePlatform` - Platform type and access (Shopify/WooCommerce/Magento/Custom)
- `inventorySync` - Real-time inventory synchronization
- `orderProcessing` - Order webhook and processing
- `customerSync` - Customer data sync to CRM
- `paymentGateway` - Payment processing integration
- `shippingIntegration` - Shipping provider integration
- `productCatalog` - Product data management
- `analytics` - E-commerce analytics tracking

### 2. Current Component
**File:** `discovery-assistant/src/components/Phase2/ServiceRequirements/Integrations/IntEcommerceSpec.tsx`
**Current problem:** Simplified implementation (~52 lines)

### 3. Reference Example
**IntComplexSpec.tsx** (from previous prompt) - Multi-system integration patterns

## Tab Organization (6 tabs)

1. **פלטפורמת E-commerce** (`platform`):
   - Platform type (Shopify/WooCommerce/Magento/BigCommerce/Custom)
   - Store URL
   - Admin access credentials:
     - **Shopify:** Store name, API key, API secret, access token
     - **WooCommerce:** Consumer key, consumer secret, webhook secret
     - **Magento:** Admin token, API endpoint
     - **Custom:** API endpoint, auth method, credentials
   - API version
   - Webhook support checkbox
   - Webhook endpoints (orders, inventory, customers)

2. **סנכרון מלאי** (`inventory`):
   - Real-time sync enabled checkbox
   - Sync direction (one-way/bi-directional)
   - Inventory source (e-commerce → ERP or ERP → e-commerce)
   - Update frequency (real-time/hourly/daily)
   - Stock threshold alerts (low stock notification)
   - Alert email
   - Reserve stock during checkout checkbox
   - Backorder handling (allow/prevent/notify)

3. **עיבוד הזמנות** (`orders`):
   - Order webhook enabled checkbox
   - Webhook URL
   - Order status sync enabled
   - Status mappings array:
     - E-commerce status
     - Internal status
     - Action (notify customer/update inventory/invoice)
   - Automatic fulfillment enabled
   - Fulfillment system (internal/3PL/dropshipping)
   - Order confirmation email enabled
   - Add/remove status mappings

4. **לקוחות ותשלומים** (`customersPayments`):
   - **Customer sync:**
     - Sync to CRM enabled
     - CRM system (Zoho/Salesforce/HubSpot)
     - Auth and credentials
     - Sync fields array (email, name, phone, address, purchase history)
     - New customer notification
   - **Payment gateway:**
     - Gateway (Stripe/PayPal/Square/Tranzila/Other)
     - Credentials (API key, secret, merchant ID)
     - Supported methods (credit card/PayPal/Apple Pay/etc.)
     - Refund handling (auto/manual)

5. **משלוחים וקטלוג** (`shippingCatalog`):
   - **Shipping integration:**
     - Provider (Israel Post/DHL/FedEx/UPS/Local)
     - API credentials
     - Auto-generate label checkbox
     - Tracking sync enabled
     - Tracking notification to customer
   - **Product catalog:**
     - Product sync enabled
     - Sync direction (e-commerce → ERP or bi-directional)
     - Sync frequency
     - Fields to sync (SKU, name, price, description, images, categories)
     - Price rules (markup %, minimum margin)

6. **ניתוח ותחזוקה** (`analytics`):
   - Analytics tracking enabled
   - Metrics to track (sales, conversion rate, cart abandonment, avg order value)
   - Google Analytics integration (tracking ID)
   - Facebook Pixel (pixel ID)
   - Custom dashboard URL
   - Abandoned cart recovery:
     - Enabled checkbox
     - Email reminder after (hours)
     - Reminder template
   - Performance monitoring (uptime, page load, checkout errors)

## Success Criteria

- [ ] All 60+ fields from interface implemented
- [ ] 6 tabs organizing fields logically
- [ ] Conditional platform credentials (Shopify/WooCommerce/Magento/Custom)
- [ ] Inventory, orders, customers, payments, shipping all configured
- [ ] Product catalog sync with price rules
- [ ] Analytics and abandoned cart recovery
- [ ] TypeScript compiles with 0 errors

**File to replace:** `discovery-assistant/src/components/Phase2/ServiceRequirements/Integrations/IntEcommerceSpec.tsx`

**Expected size:** ~900-1,100 lines
