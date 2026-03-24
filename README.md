# Payment Checkout Challenge

Single page checkout application for purchasing seeded products with sandbox card payments.

## Stack

- Frontend: React 19, Vite, Redux Toolkit, React Router
- Backend: NestJS, Prisma, PostgreSQL
- Testing: Jest, Testing Library
- Infrastructure: Docker Compose for local PostgreSQL

## Business Flow

1. Product list with stock, description, and price
2. Product detail with quantity selector and fee calculation
3. Checkout form for customer, delivery, and card information
4. Payment summary and payment submission
5. Transaction result screen with polling for pending payments
6. Return to the product catalog with updated stock

## Architecture

### Frontend

- Redux Toolkit is used for product state and checkout state
- Checkout progress persists in localStorage
- Card CVC is never stored in Redux or localStorage
- The UI is split into pages for list, detail, checkout, summary, and result

### Backend

- Hexagonal-inspired structure with domain, application, and infrastructure layers
- Use cases hold the business logic
- Controllers stay thin and delegate to use cases
- Repository and payment gateway dependencies are injected through ports
- Result type implements railway-oriented flow for success and error handling

## Data Model

### Product

- id
- name
- description
- price
- currency
- stock
- imageUrl

### Customer

- id
- fullName
- email
- phone

### Transaction

- id
- productId
- customerId
- quantity
- amount
- baseFee
- deliveryFee
- total
- status
- wompiReference
- paymentMethod

### Delivery

- id
- transactionId
- customerId
- address
- city
- department
- postalCode
- status

## API Endpoints

### Products (stock)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/products | List all products with stock |
| GET | /api/products/:id | Get a specific product |

### Transactions

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/transactions | Create a transaction |
| POST | /api/transactions/:id/pay | Process payment for a transaction |
| GET | /api/transactions/:id | Get transaction status |

### Customers

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/customers/:id | Get customer by ID |
| GET | /api/customers/email/:email | Get customer by email |

### Deliveries

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/deliveries/transaction/:transactionId | Get delivery by transaction |

Postman collection: [postman_collection.json](postman_collection.json)

## Environment Variables

### Backend

- DATABASE_URL
- PORT
- FRONTEND_URL
- WOMPI_API_URL
- WOMPI_PUBLIC_KEY
- WOMPI_PRIVATE_KEY

### Frontend

- VITE_API_URL
- VITE_WOMPI_PUBLIC_KEY

## Local Setup

### 1. Start PostgreSQL

```bash
docker compose up -d
```

### 2. Backend

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
npm run start:dev
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

## Sandbox Payment Notes

- Sandbox environment must be used for all payment tests
- Real money is not required
- Card data must be fake but structurally valid
- Acceptance token and card token are obtained before final payment processing

## Security Notes

- Helmet security headers enabled in the backend
- DTO validation enabled through Nest ValidationPipe
- CVC is requested only at payment time and not persisted
- Only sandbox credentials should be used in development and testing

## Testing

### Backend

18 test suites, 96 tests — all passing.

| Metric | Coverage |
|--------|----------|
| Statements | 92.90% |
| Branches | 77.92% |
| Functions | 96.47% |
| Lines | 92.54% |

```bash
cd backend
npx jest --coverage
```

### Frontend

11 test suites, 71 tests — all passing.

| Metric | Coverage |
|--------|----------|
| Statements | 91.91% |
| Branches | 87.34% |
| Functions | 86.66% |
| Lines | 93.17% |

```bash
cd frontend
npx jest --coverage
```

Tested layers: domain entities, DTOs, Result type, use cases, controllers, repository adapters, payment gateway adapter, Redux slices, API service, React pages, utility functions.