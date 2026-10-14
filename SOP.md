# Standard Operating Procedure (SOP) – Admin & Operations Dashboard

## 1. Introduction & System Overview
Welcome to the Thebloomaa Admin Operations Dashboard! This system is designed to streamline your daily workflow, from verifying new orders to managing riders and tracking real-time deliveries.

The system uses a strict **2-Stage Workflow** to prevent errors and ensure riders only receive fully verified and paid orders:
- **Stage 1 (Operations & Dispatch Intelligence):** The global command center. All new orders land here first. Your primary task is to review payment proofs and **Approve** or **Reject** them.
- **Stage 2 (Order Management):** The daily dispatch board. Only **Approved** orders appear here. This page is used to monitor active deliveries for a specific date, assign riders, and confirm completed drops.

---

## 2. STAGE 1: Operations & Dispatch Intelligence

This is your main dashboard. It acts as the hub for all administrative tasks and contains four main tabs.

### 2.1. Live Order Dispatch & Verification
When a customer places a new order, it lands here with a `PENDING` subscription status.
**Goal:** Verify the payment and approve the order so it moves to dispatch.

**Detailed Steps:**
1. Navigate to the **Live Order Dispatch & Verification** tab.
2. Look for the yellow **"Pending Payment"** filter pill above the orders table. Click it to filter for all unverified orders.
3. In the "Admin Actions" column, click **View Receipt**. A modal will open showing the customer's payment details.
4. Verify the provided UTR number or the attached screenshot against your bank/UPI records.
5. **If payment is valid:** 
   - Click the **Approve Payment** button. 
   - The order is now marked as `Approved` and will automatically move to Stage 2 (Order Management) for dispatch. The subscription status becomes `ACTIVE`.
6. **If payment is invalid/missing:** 
   - Click the **Reject Payment** button. 
   - A text box will appear. Enter the exact reason for rejection (e.g., "UTR number incorrect", "Payment not received", or "Screenshot blurry"). 
   - Click confirm. The customer will be able to see this specific rejection reason in their dashboard.

### 2.2. Fleet & Riders Management
Use this tab to onboard new delivery personnel and manage existing ones.
**Goal:** Maintain an active fleet and assign them to specific operational zones.

**Detailed Steps:**
1. Navigate to the **Fleet & Riders** tab.
2. **Add a Rider:** Click **Add New Rider**. Enter their Name, Phone number (this is used for their rider app login), and Vehicle Type.
3. **Assign Zones:** Once a rider is added, click **Manage Zones** next to their name. Select the specific delivery zones (pincodes) they are responsible for covering.
4. **Active Toggle:** You can toggle a rider's **Active** status on or off. Inactive riders will be excluded from the auto-assignment system.

### 2.3. Customers & Subscriptions
Use this tab for customer support and subscription monitoring.
**Goal:** Manage customer requests, view dietary preferences, and track active subscriptions.

**Detailed Steps:**
1. Navigate to the **Customers & Subscriptions** tab.
2. Use the search bar to find a customer quickly by Name, Phone Number, or Email.
3. You can filter the customer list by **Diet Plan** using the dropdown menu.
4. In this view, you can see their active plans, total deliveries left, assigned allergies, and contact details.

### 2.4. Delivery Zones Management
Use this tab to define geographical boundaries for your deliveries.
**Goal:** Group pincodes into logical zones for the auto-assign system.

**Detailed Steps:**
1. Navigate to the **Delivery Zones** tab.
2. Click **Create New Zone**.
3. Name the zone descriptively (e.g., "Patna Central", "Boring Road").
4. Enter the active Pincodes for that zone, separated by commas.
5. Click Save. This setup is crucial for the "Auto-Assign Fleet" feature in Stage 2.

---

## 3. STAGE 2: Order Management

Once an order is **Approved** in Stage 1, it flows into the Order Management page. This page is strictly for **Daily Dispatch** operations.

### 3.1. Daily Dispatch & Kitchen Manifest
**Goal:** Organize the day's deliveries and export lists for the kitchen team.

**Detailed Steps:**
1. Navigate to the **Order Management** page.
2. Use the **Delivery Date Filter** at the top right to select either **Today**, **Tomorrow**, or choose a **Custom Date**. The table will only show approved orders scheduled for that specific date.
3. Click **Export Manifest** to download an Excel (.xlsx) sheet of the day's approved orders. Share this document with the kitchen team so they know exactly what to prepare and pack.

### 3.2. Rider Assignment
**Goal:** Assign riders to approved orders before dispatch.

**Detailed Steps:**
1. Ensure your Delivery Zones and Riders are set up correctly in Stage 1.
2. Click the **Auto-Assign Fleet** button. The system will automatically map unassigned orders to the correct riders based on matching pincodes/zones.
3. **Manual Override:** If you need to manually assign or change a rider, click the **Assign Rider** dropdown on an individual order row and select the appropriate rider from the list.

### 3.3. Double-Mark Verification (Delivery Completion)
To prevent false delivery marks by riders and ensure quality control, the system uses a double-verification method.
**Goal:** Confirm that a delivery was successfully completed.

**Detailed Steps:**
1. When a rider marks an order as delivered on their mobile app, the order status changes to **`RIDER_DELIVERED`**.
2. On your Order Management dashboard, these orders will be highlighted under the "Pending Double-Mark" counter.
3. Review the delivery (check for photo proof or customer confirmation if necessary).
4. Click **Verify Drop** next to the order. This officially marks the order as **`DELIVERED`** and deducts one day from the customer's subscription balance.

---

## 4. Troubleshooting & Status Glossary

### Order Status Meanings
* **`QUEUED` (Unapproved):** Order placed, waiting for payment verification in Stage 1.
* **`QUEUED` (Approved):** Payment verified, ready for dispatch in Stage 2.
* **`RIDER_DELIVERED`:** Rider marked the drop as complete; waiting for admin double-verification.
* **`DELIVERED`:** Admin has double-verified the drop. Process complete.
* **`FAILED`:** Order was cancelled or payment was rejected.
* **`SKIPPED`:** Customer skipped this delivery date.

### Subscription Status Meanings
* **`PENDING`:** Initial state, waiting for the first payment to be approved by admin.
* **`ACTIVE`:** Payment approved; deliveries are actively happening.
* **`PAUSED`:** Subscription paused by the customer.
* **`FAILED`:** Payment rejected or subscription fully cancelled.

---
*End of Document*
