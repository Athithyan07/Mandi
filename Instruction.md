
MANDI CONNECT
Office App
Development Workflow & Functional Requirements
Project: Vegetable, groceries & Rice Distribution Management System
Audience: App Developers, UI/UX Designers, 
Document purpose: Define required modules, business rules, workflows and acceptance tests.

 1. Application Overview
The Mandi Connect Office App is the central management system for a vegetable and rice distribution business. It must connect with the Receiver Company App so orders submitted by receiver companies are reflected in the Office App. The application manages purchasing, inventory, orders, deliveries, billing, collections and reporting.
2. User Roles and Access Control
Role	Access and Responsibilities
Owner	Full access to modules, reports, settings and business performance.
Admin	Manage daily operations, users and permissions.
Driver	View assigned deliveries and update delivery status and proof of delivery.

Role permissions must be configurable. Price changes, order cancellations, stock adjustments and payment edits must be restricted to authorised users and recorded in an audit trail.
3. Owner Dashboard
Objective: Show overall business performance in one place.
•	Today's total sales and purchases.
•	Orders received, pending approval, confirmed, dispatched and delivered.
•	Collections split by cash, UPI and bank transfer.
•	Customer outstanding and supplier outstanding balances.
•	Current stock quantities and stock valuation.
•	Low-stock and out-of-stock alerts.
•	Damaged and wasted stock quantity and value.
•	Daily, weekly and monthly profit reports.
Developer requirements
•	Dashboard figures must update when relevant transactions are recorded.
•	Allow filters by date, product, customer, supplier and warehouse where relevant.
•	Allow authorised users to open a dashboard figure and view underlying transactions.
•	Keep sales, collections and profit as separate measures.
•	Clearly label estimated profit. Net profit must include applicable recorded costs and expenses.
4. Product and Rate Management
4.1 Product setup
•	Product ID, product name, image, category, SKU/product code and status.
•	Unit of measurement, purchase price, default selling price and minimum margin.
•	Applicable tax details and configurable product attributes.
•	Authorised users can create, edit, activate or deactivate products.




4.2 Categories and units
Maintain separate, configurable categories for vegetables and rice.
Category	Examples
Vegetables	Tomato, onion, potato, carrot, beans, green chilli and other vegetables.
Rice	Ponni rice, Sona Masoori, Idli rice, Basmati rice and other varieties.
groceries	Salt, Wheat, Kadalai paruppu

Supported units: kilogram (kg), gram (g), bag, sack, piece and bundle. For bags and sacks, allow a standard weight to be configured. Example: 1 rice bag = 25 kg. Convert bag/sack quantities into the base stock unit when a conversion is configured.
4.3 Customer-specific pricing
Support different selling prices for different receiver companies. When an order is created, retrieve the active price for that customer and product. If no customer-specific price exists, use the default selling price.
Product (illustrative)	Customer A	Customer B	Customer C
Tomato	₹30/kg	₹32/kg	₹29/kg
Onion	₹35/kg	₹34/kg	₹36/kg
Ponni Rice	₹1,400/bag	₹1,420/bag	₹1,380/bag

4.4 Daily rates and rice details
•	Allow authorised staff to update vegetable rates daily and retain price history with effective date/time.
•	Apply updated prices to new orders according to the configured pricing policy; do not silently alter confirmed orders.
•	For rice, maintain brand, variety, grade, bag weight, packing size, batch number where applicable, purchase date and best-before/expiry date where applicable.
5. Purchase and Supplier Management
5.1 Supplier registration
•	Supplier ID/name, contact person, phone number, address and supplier category.
•	Applicable tax registration details, payment terms, outstanding balance and payment details where required.
5.2 Purchase order
1.	Select supplier and products.
2.	Enter ordered quantity, unit, purchase rate and estimated amount.
3.	Add transport or other purchase charges where applicable.
4.	Save, approve, print or share the purchase order.
Purchase order statuses: Draft, Approved, Ordered, Partially Received, Fully Received and Cancelled.
5.3 Goods receipt
•	Record purchase order number, product, ordered quantity, received quantity and actual measured weight.
•	Record accepted quantity, damaged quantity, rejected quantity, purchase rate, additional charges and receipt date.
•	Record supplier invoice number and attach invoice/payment receipt files.
•	Compare ordered and received quantities and flag discrepancies.
•	Only accepted goods increase available inventory.


5.4 Supplier payments
•	Record advances, full payments and partial payments.
•	Maintain supplier-wise outstanding balances and payment history.
•	Generate supplier payable reports and allow authorised attachments for invoices and receipts.
6. Inventory and Wastage Control
6.1 Stock movement rules
Transaction	Required stock behaviour
Accepted purchase receipt	Increase physical and available stock.
Order reservation	Move quantity from available to reserved stock.
Order dispatch	Reduce physical stock and release the corresponding reservation.
Sales return	Inspect returned goods; add to available stock only if approved as saleable.
Wastage / damage	Reduce usable stock through an approved stock transaction.
Warehouse transfer	Reduce stock at source and increase stock at destination, with traceable transfer records.

6.2 Stock ledger and warehouse
•	Show opening stock, purchased, reserved, dispatched, returned, wasted, available quantity and stock value.
•	Support multiple warehouses/storage locations and warehouse-wise stock ledgers.
•	Record stock transfers and approved adjustments.
•	Configure minimum-stock levels and generate low-stock/out-of-stock alerts.
•	Track rice batches and applicable best-before/expiry dates.
•	Support physical stock counts and reports comparing counted stock against system stock.
Prevent duplicate stock movements for the same transaction. Every stock adjustment must record the user, time, reason and approval where required.
7. Order Management
7.1 Order sources and synchronisation
•	Receive orders from the Receiver Company App.
•	Allow office staff to create orders received by phone or WhatsApp, and record the order source.
•	Assign a unique order number.
•	Retrieve customer-specific pricing and check stock availability.
•	Notify authorised office staff when a new order arrives.
•	Synchronise permitted status updates back to the Receiver Company App.
7.2 Order approval and editing
•	Authorised staff can approve, reject with a reason, or modify orders.
•	Check price, stock and customer credit rules before confirmation where configured.
•	Allocate a warehouse and reserve stock.
•	Record changes to confirmed orders and notify the receiver company of relevant changes.
7.3 Status workflow
Order Received → Pending Approval → Confirmed → Stock Reserved → Picking → Packed → Dispatched → Out for Delivery → Delivered → Completed
Additional statuses: Rejected, Cancelled, Partially Fulfilled, Backordered, Delivery Failed and Returned. Implement valid status transitions and restrict unauthorised changes.
7.4 Documents and partial fulfilment
•	Generate order confirmation, picking list, packing list, sales invoice and delivery challan.
•	If only part of an order is available, record available, dispatched and remaining quantities separately.
•	Keep remaining quantities pending/backordered or allow an authorised cancellation.
•	Bill according to the actual invoiced quantity and inform the receiver company of partial fulfilment.
8. Delivery and Driver Management
8.1 Driver and vehicle records
•	Driver ID, name, mobile number and licence details where required.
•	Vehicle number, type, capacity and status.
8.2 Delivery assignment
5.	Select confirmed and packed orders.
6.	Group multiple orders into a delivery trip and set delivery sequence.
7.	Assign driver and vehicle.
8.	Validate total assigned load against configured vehicle capacity.
9.	Record dispatch time and generate a delivery sheet.
8.3 Driver workflow and proof of delivery
•	Show assigned orders, customer name, delivery address, required contact details, products, quantities, payment due and instructions.
•	Capture delivery date/time, receiver name, delivered quantity, shortage, returns, remarks and signature/photo as configured.
•	Allow drivers to record failed delivery reasons, such as customer unavailable, wrong address, refusal or transport issue.
•	Keep failed deliveries visible to office staff until resolved.
8.4 Delivery collections
•	Record cash, UPI or other authorised payment collected by the driver.
•	Link collection to the customer invoice and update outstanding balance.
•	Generate collection confirmation and reconcile driver collections when remitted to the office.
9. Billing and Accounts
9.1 Customer ledger and invoices
•	Maintain opening balance, invoices, credit notes, advances, part-payments and authorised adjustments.
•	Generate invoices with unique invoice number, date, customer details, product, quantity, unit, rate, discount where applicable, taxable value, GST details where applicable, total, paid amount and balance due.
•	Support configured invoice numbering and payment terms.
9.2 Payments and credit control
•	Support cash, UPI, bank transfer and other configured payment methods.
•	Record payment reference, date, amount and invoice allocation.
•	Support advance payments and payments against multiple invoices where permitted.
•	Configure customer credit limits and payment terms.
•	Alert staff about overdue invoices and credit-limit breaches; require authorised approval for exceptions.
9.3 Supplier payables and reports
•	Show supplier outstanding, due dates, overdue amounts, payments and remaining payable.
•	Generate daily collection, cash, UPI, bank, customer outstanding, supplier outstanding, overdue, invoice register and credit note reports.
•	Distinguish invoices issued from payments actually collected.
•	Support applicable GST treatment and accounting exports; validate statutory formats and calculations before production release.
10. End-to-End Business Workflow
10.	Product Setup: Admin configures products, units, purchase rates, selling rates and customer-specific prices.
11.	Supplier Purchase: Purchase manager creates and approves purchase orders.
12.	Goods Receipt: Warehouse staff records received weight, shortages, damage and rejected quantities.
13.	Stock Update: Accepted goods update inventory through a goods receipt transaction.
14.	Customer Order: Receiver company submits an order in its app, or office staff creates one manually.
15.	Order Validation: System retrieves customer pricing and checks stock and configured credit rules.
16.	Order Approval: Authorised staff confirms, rejects or modifies the order.
17.	Stock Reservation: System reserves available stock for the confirmed order.
18.	Picking and Packing: Warehouse staff prepares goods and records packed quantities.
19.	Delivery Assignment: Delivery manager assigns orders to a driver, vehicle and trip.
20.	Dispatch: System records dispatched quantities and updates physical stock exactly once.
21.	Delivery Confirmation: Driver records delivered quantities, proof of delivery, shortages and returns.
22.	Invoice and Payment: Generate the appropriate invoice and record payments collected.
23.	Account Update: Customer balances, supplier balances, inventory and reports update from the transaction records.
24.	Owner Reporting: Owner reviews sales, purchases, stock, collections, outstanding balances and profit.
11. Essential System Rules
25.	Every order must have a unique order number and every invoice a unique invoice number.
26.	Every stock movement must be recorded in a traceable stock ledger.
27.	Payment transactions must have a unique internal reference and appropriate payment details.
28.	Confirmed orders retain their confirmed prices unless an authorised change is recorded.
29.	Stock must not be deducted twice for the same dispatch.
30.	When an order is cancelled, eligible stock reservations must be released.
31.	Returned goods must not become saleable stock before the configured inspection/approval process.
32.	Price, order, payment and stock changes must maintain an audit trail.
33.	Users can access only the modules and data allowed by their roles.
34.	Validate quantities, units, prices, discounts, taxes and payment amounts.
35.	Use consistent calculation rules across dashboards and reports.
36.	Failed operations must not leave orders, payments or stock in inconsistent states.
37.	Back up critical business data according to the agreed backup and recovery policy.
38.	Synchronise Office, Receiver Company and Driver applications securely and prevent duplicate requests from duplicating transactions.

12. Development Acceptance Tests
Test Case	Expected Result
Create a vegetable product	Product appears in the catalogue.
Update daily vegetable rate	New rate applies according to configured pricing rules.
Create supplier purchase order	Order is saved and traceable.
Receive less than ordered	Discrepancy is recorded.
Receive accepted goods	Inventory increases correctly.
Receive receiver-company order	Order appears in Office App with customer and price details.
Order exceeds available stock	System blocks over-allocation or flags the shortage according to configuration.
Confirm order	Eligible stock is reserved.
Dispatch order	Stock is deducted exactly once.
Deliver part of an order	Delivered and remaining quantities are recorded separately.
Collect partial payment	Paid amount and balance due are correct.
Cancel a reserved order	Eligible reservation is released.
Record damaged goods	Usable stock and wastage reports update.
Exceed credit limit	Configured warning or approval requirement is triggered.
Change a confirmed order	Authorised change and audit history are saved.
Generate monthly report	Totals reconcile to underlying transactions.

The application should pass the agreed acceptance tests before production deployment.
13. Recommended Development Phases
Phase	Modules	Priority
Phase 1	Product & Rate Management; Supplier and Purchase Management	Essential
Phase 2	Inventory Management; Order Management; Receiver Company App Integration	Essential
Phase 3	Delivery Management; Driver Functions; Billing & Accounts	Essential
Phase 4	Advanced Dashboard; Profit Analysis; Automated Alerts; Advanced Reports	Enhancement

14. Required Developer Deliverables
39.	Screen-by-screen UI/UX workflow: screens, forms, buttons, validation and actions.
40.	Database design: tables, fields, relationships, stock ledger, payment ledger and audit records.
41.	API integration specification: secure communication between Office App, Receiver Company App and Driver App.
42.	Role and permission matrix.
43.	Test plan and acceptance-test results.
44.	Deployment, backup, recovery and support plan.
15. Expected Final Result
The Mandi Connect Office App must provide a single platform to manage the vegetable and rice distribution business. Purchasing, inventory, orders, delivery, invoicing, collections and reporting must be connected so that each completed transaction updates the relevant modules accurately. The owner should be able to monitor the business without manually combining information from separate registers or applications.
Developer recommendation: Design the database and transaction workflows first, then build the screens. Validate the complete order-to-delivery-to-payment journey before adding advanced reporting.