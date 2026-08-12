# Kristallball Military Asset Management System (MAMS)

An enterprise-grade asset management system tracking military stock (weapons, vehicles, ammunition) across bases, securing state changes under database transactions, and implementing granular role-based access scopes.

## Technology Stack
- **Frontend**: React (Vite), Tailwind CSS v4, Lucide React (Icons), Recharts (Charts), Axios (HTTP Client)
- **Backend**: Node.js, Express.js (ES6+ Modules), Helmet, CORS, JSON Web Tokens
- **Database**: SQLite (local development) via Prisma ORM (ACID-compliant relational ledger)

---

## Local Setup & Quickstart

Follow these steps to run the backend and frontend servers locally.

### 1. Prerequisites
- **Node.js** (v18.x or higher)
- **npm** (v10.x or higher)

### 2. Backend Server Setup
Navigate to the `backend/` directory:
```bash
cd backend
```
Install dependencies:
```bash
npm install
```
Configure `.env` file (A pre-configured file is provided inside the folder):
```env
DATABASE_URL="file:./dev.db"
PORT=5000
JWT_SECRET="kristallball_super_secret_key_123!"
```
Initialize the database (run local migrations) & compile client:
```bash
npx prisma generate
npx prisma migrate dev --name init
```
Seed the database with bases, equipment types, and demo credentials:
```bash
node prisma/seed.js
```
Start the development server:
```bash
npm run dev
```
The API is now running at `http://localhost:5000/api`.

### 3. Frontend Dashboard Setup
Open a new terminal window and navigate to the `frontend/` directory:
```bash
cd frontend
```
Install dependencies:
```bash
npm install
```
Start the frontend development server:
```bash
npm run dev
```
Open your browser at `http://localhost:5173`.

---

## Sample Testing Credentials

You can use the quick credential switchers on the login page, or manually enter these:

| Role | Username | Password | Scope / Base Assigned |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin_user` | `AdminPass123!` | Global (All bases dashboard) |
| **Base Commander** | `commander_alpha` | `CommandPass123!` | Base #1 - Fort Alpha |
| **Base Commander** | `commander_bravo` | `CommandPass123!` | Base #2 - Fort Bravo |
| **Logistics Officer** | `logistics_officer` | `LogisticsPass123!` | Base #1 / Global Ops (Purchase / Transfers) |

---

## Technical Design & Calculations

### 1. Granular Security (RBAC Scope Enforcement)
- **Base Commanders**: Automatically scoped to their base ID. The backend routes coerce queries for `/dashboard-metrics`, `/status`, and `/audit-logs` to inject their base ID, and reject any mutation body that attempts to modify assets outside of their base ID (such as checking out equipment or transferring out of another commander's base).
- **Logistics Officers**: Given access to inventory purchases, transfers, and general audit trails.
- **Admins**: Complete unrestricted control.

### 2. Dynamic Inventory Formulation
Stock balance calculations are processed dynamically to ensure 100% data auditability and prevent database sync anomalies:
$$\text{Closing Balance} = \text{Opening Balance} + \text{Net Movement} - \text{Assigned} - \text{Expended}$$
$$\text{Net Movement} = \text{Purchases} + \text{Transfers In} - \text{Transfers Out}$$

### 3. Atomic transfers & Negative Stock Prevention
All transactions modifying stocks (procurements, base transfers, active checkouts, resource consumption) are executed inside **Prisma DB Transactions** ensuring strict ACID compliance. 
Before executing a Transfer, Checkout, or Expenditure, the backend queries the source base's stock. If the available quantity is less than the requested amount, the transaction is safely aborted (rolled back) and a `400 Bad Request` is returned to prevent negative inventories.
