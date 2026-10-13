# Payment API

A RESTful API for payment management built with Node.js, TypeScript, and Express. This project explores payment processing concepts, request validation, idempotency, and API design.

**Status:** Work in progress.

## Overview

The Payment API is a backend project focused on developing a reliable foundation for payment-related operations.

The project is being developed incrementally, starting with REST endpoints and in-memory storage before introducing database persistence and more advanced payment lifecycle management.

## Tech Stack

* **Node.js** — JavaScript runtime
* **TypeScript** — Static typing
* **Express.js** — REST API framework
* **Git and GitHub** — Version control

## Features

* RESTful endpoints for creating and retrieving payments.
* Request validation for payment data.
* Idempotency keys to prevent duplicate payment creation when requests are retried.
* Unique identifiers for payment records.
* Basic payment status management.
* In-memory storage for development and testing.

## Getting Started

### Prerequisites

* Node.js and npm installed.
* Git installed.

### Installation

Clone the repository:

```bash
git clone https://github.com/Rafess/payment-api.git
```

Navigate to the project directory:

```bash
cd payment-api
```

Install the dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The API is expected to run at:

`http://localhost:3000`

## API Endpoints

The following endpoints are part of the current payment API implementation.

| Method | Endpoint            | Description              |
| ------ | ------------------- | ------------------------ |
| POST   | `/api/payments`     | Create a payment         |
| GET    | `/api/payments`     | Retrieve all payments    |
| GET    | `/api/payments/:id` | Retrieve a payment by ID |
| POST   | `/api/recipients`   | Create a recipient       |
| GET    | `/api/recipients`   | Retrieve all recipients  |
| GET    | `/api/recipients/:id` | Retrieve a recipient by ID |

### Create a Payment

**POST** `/api/payments`

Headers:

```http
Content-Type: application/json
Idempotency-Key: payment-demo-001
```

Request body:

```json
{
  "customerId": "customer-123",
  "amountInCents": 25990,
  "recipientId": "recipientId"*
  "currency": "BRL"
}
```
* You will need to create a recipient before creating a payment *

The amount is represented in the smallest currency unit to avoid relying on floating-point decimal arithmetic for monetary values.

A successful request returns the created payment and its unique identifier.

### Idempotency

The API uses an `Idempotency-Key` header to identify repeated requests belonging to the same operation.

The intended behavior is:

* Repeating a request with the same key and identical data returns the original payment.
* Reusing a key with a different payload returns `409 Conflict`.
* A request without the required key is rejected.

The current implementation uses in-memory storage, so idempotency records are not preserved across server restarts.

## Current Limitations

This project is still under development.

* Payment and idempotency records are stored in memory.
* Data is lost when the server restarts.
* Payment processing is not connected to a real payment provider.
* Payment status transitions and asynchronous processing are not fully implemented.
* Persistent storage and database-level concurrency protection are planned.

## Roadmap

* [x] Implement recipient registration and retrieval.
* [x] Associate payments with registered recipients.
* [x] Introduce Prisma and MySQL for persistent storage.
* [ ] Add database-backed idempotency and concurrency protection.
* [ ] Implement payment status transitions and failure handling.
* [ ] Add automated tests for validation, idempotency, and payment operations.
* [ ] Improve API documentation and error handling.

## Disclaimer

This project is intended for educational purposes and portfolio development. It does not process real payments or handle real financial transactions.

## License

A license has not yet been selected for this project.
