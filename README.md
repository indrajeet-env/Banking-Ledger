# Banking Ledger System

A production-grade, secure banking ledger system built with Node.js, Express, and MongoDB. It manages user accounts, transactions, and ledger entries while ensuring strong consistency, transaction idempotency, and transactional integrity.

## Live API
Base URL: https://banking-ledger-ajsh.onrender.com

## Key Features

- **True Ledger-Based Balances**: Account balances are not hardcoded. Instead, they are dynamically computed on-the-fly via MongoDB aggregation pipelines (summing credits and debits from the ledger) to ensure precision and absolute data consistency.
- **Idempotency**: Prevents double-processing of transactions due to network failures or retry loops by leveraging client-generated `idempotencyKey` values.
- **Immutable Ledger Entries**: Using Mongoose pre-save and pre-delete hooks, ledger entries are strictly immutable. Once a financial record is logged, it cannot be modified or deleted.
- **Secure Authentication**: User authentication via JWT (JSON Web Tokens) and password hashing with `bcryptjs`.
- **System Transactions**: Support for initialization of funds and system-level transactions.
- **Email Integration**: Integrated with `nodemailer` and OAuth for transactional emails (e.g., alerts or notifications).

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB, Mongoose ODM
- **Security & Auth**: JWT, bcryptjs, cookie-parser
- **Other**: Nodemailer (with Google OAuth2)

## API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Register a new user
- `POST /login` - Login user and return JWT
- `POST /logout` - Logout user (clears cookies)

### Accounts (`/api/accounts`)
- `POST /` - Create a new bank account for the authenticated user
- `GET /` - Get all accounts mapped to the authenticated user
- `GET /balance/:accountId` - Retrieve the exact computed balance of a specific account using ledger aggregation

### Transactions (`/api/transactions`)
- `POST /` - Create a transfer transaction between accounts (requires auth & idempotency key)
- `POST /system/initial-funds` - Inject initial funds into an account programmatically (restricted to system users)

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16+ recommended)
- [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas cluster)

### Installation

1. Clone the repository and navigate to the project directory:
   ```bash
   cd Bank-ledger
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   Create a `.env` file in the root directory. You must supply the following variables:
   ```env
   # Database Configuration
   MONGO_URI=mongodb+srv://<db_user>:<db_password>@<cluster>.mongodb.net/<db_name>
   
   # Security & Auth
   JWT_SECRET=your_super_secret_jwt_key
   
   # Email Services (Nodemailer config using OAuth2)
   CLIENT_ID=your_google_oauth_client_id
   CLIENT_SECRET=your_google_oauth_client_secret
   REFRESH_TOKEN=your_google_oauth_refresh_token
   EMAIL_USER=your_email@gmail.com
   ```

### Running the Application

**For Development (auto-reloads on changes):**
```bash
npm run dev
```

**For Production:**
```bash
npm start
```

The server will typically start on port 3000 (or on the PORT environment variable if specified). You should see `server is running at port 3000` in your console upon successful startup.