# Stack Storm - E-Commerce Ordering System 🚀

A full-stack e-commerce application for order management and inventory control. Built with **Spring Boot** backend and **React** frontend, featuring JWT authentication, role-based access control, and a complete order processing workflow.

**Status:** HCL Hackathon Project | Sprint 0 - MVP

---

## 📋 Table of Contents

- [System Overview](#system-overview)
- [Tech Stack](#tech-stack)
- [Architecture & End-to-End Flow](#architecture--end-to-end-flow)
- [Project Structure](#project-structure)
- [Features](#features)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [Installation & Setup](#installation--setup)
- [Running the Application](#running-the-application)
- [Usage Examples](#usage-examples)
- [Authentication & Security](#authentication--security)
- [Error Handling](#error-handling)

---

## 🎯 System Overview

**Stack Storm** is a complete e-commerce platform that enables:

- **Users** to register, login, browse items, manage a shopping cart, and place orders
- **Admins** to manage inventory (add/delete items)
- **Secure transactions** with JWT-based authentication
- **Real-time stock management** with validation

The system handles the complete order lifecycle from item browsing to successful order placement with payment details.

---

## 🛠️ Tech Stack

### Backend

- **Framework:** Spring Boot 4.0.5
- **Language:** Java 17
- **Database:** H2 (embedded, development-ready)
- **Build Tool:** Maven
- **Security:** Spring Security + JWT (JSON Web Tokens)
- **Data Mapping:** Spring Data JPA + Lombok
- **API:** RESTful with CORS support

### Frontend

- **Framework:** React 19.2.4
- **Build Tool:** Vite 8.0.4
- **HTTP Client:** Axios
- **Styling:** CSS3
- **Package Manager:** npm

---

## 🏗️ Architecture & End-to-End Flow

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                            │
│  ┌──────────────┬──────────────┬──────────────┬──────────────┐     │
│  │ LoginPage    │ RegisterPage │  MenuPage    │   CartPage   │     │
│  └──────────────┴──────────────┴──────────────┴──────────────┘     │
│         │               │              │              │            │
│         └───────────────┴──────────────┴──────────────┘            │
│                         ▼                                           │
│                   Axios HTTP Client                                │
│                   (JWT Bearer Token)                               │
└─────────────────────────────────────────────────────────────────────┘
                            ▼ HTTP/REST
┌─────────────────────────────────────────────────────────────────────┐
│                    BACKEND (Spring Boot)                            │
│  ┌──────────────┬──────────────┬──────────────┐                    │
│  │ AuthController│ItemController│OrderController                   │
│  └──────────────┴──────────────┴──────────────┘                    │
│         │               │              │                           │
│    ┌────▼──────┐   ┌────▼──────┐   ┌──▼──────────┐                │
│    │ AuthService│   │ItemService│   │OrderService│                │
│    └────┬──────┘   └────┬──────┘   └──┬──────────┘                │
│         │               │              │                           │
│    ┌────▼──────────────▼──────────────▼──────┐                    │
│    │   Spring Data JPA / Hibernate           │                    │
│    │     (ORM Layer)                         │                    │
│    └────┬──────────────────────────────────┬─┘                    │
│         │                                  │                       │
│  ┌──────▼──────────────────────────────────▼────┐                 │
│  │          H2 Database (Embedded)              │                 │
│  │  ┌────────┐ ┌───────┐ ┌────────┐ ┌────────┐ │                 │
│  │  │ Users  │ │ Items │ │Orders  │ │OrderItm│ │                 │
│  │  └────────┘ └───────┘ └────────┘ └────────┘ │                 │
│  └──────────────────────────────────────────────┘                 │
│                                                                    │
│  Security Layer: JWT Authentication + Role-Based Access Control   │
└─────────────────────────────────────────────────────────────────────┘
```

### End-to-End User Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                    USER JOURNEY                                   │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  1. AUTHENTICATION                                               │
│     ├─ User visits frontend (React)                              │
│     ├─ Enters email & password                                   │
│     ├─ Frontend sends POST /api/auth/login                       │
│     ├─ Backend validates credentials (BCrypt check)              │
│     ├─ JWT token generated with userId + role                   │
│     └─ Token stored in localStorage                              │
│                                                                   │
│  2. BROWSING MENU                                                │
│     ├─ Frontend automatically redirects to MenuPage              │
│     ├─ Frontend sends GET /api/items (no auth needed)            │
│     ├─ Backend returns all items with stock info                 │
│     └─ User sees categories: PIZZA, DRINK, BREAD                │
│                                                                   │
│  3. ADDING TO CART                                               │
│     ├─ User clicks "Add to Cart" on items                        │
│     ├─ Frontend updates local cart state                         │
│     ├─ User can adjust quantities in real-time                   │
│     └─ Cart persists in component state (not synced to backend)  │
│                                                                   │
│  4. CHECKOUT & PAYMENT                                           │
│     ├─ User navigates to CartPage                                │
│     ├─ Enters delivery address & payment info                    │
│     ├─ Chooses payment method: ONLINE or CASH_ON_DELIVERY        │
│     ├─ Frontend sends POST /api/orders                           │
│     │   └─ Includes: customerName, items[], paymentSummary      │
│     ├─ Backend validates:                                        │
│     │   ├─ User authenticated (JWT)                              │
│     │   ├─ Cart not empty                                        │
│     │   └─ Item stock available                                  │
│     ├─ Backend creates Order + OrderItem entries                 │
│     ├─ Stock quantities decremented                              │
│     └─ Status set to "PLACED"                                    │
│                                                                   │
│  5. ORDER SUCCESS                                                │
│     ├─ Frontend redirects to SuccessPage                         │
│     ├─ Shows order confirmation with details                     │
│     ├─ User can view order history                               │
│     └─ User can logout                                           │
│                                                                   │
│  ADMIN FLOW (if role = ADMIN)                                    │
│     ├─ Same auth process, but role = "ADMIN"                     │
│     ├─ MenuPage shows "Add Item" and "Delete Item" buttons       │
│     ├─ Admin can POST /api/admin/items with item details         │
│     ├─ Admin can DELETE /api/admin/items/{id}                    │
│     └─ @PreAuthorize("hasRole('ADMIN')") guards endpoints        │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

### Request/Response Flow Example

#### Login Flow

```
FRONTEND                              BACKEND
   │                                     │
   ├─ POST /api/auth/login ─────────────>
   │   {email, password}                  │
   │                                     ├─ Validate credentials
   │                                     ├─ BCrypt check
   │                                     ├─ Generate JWT
   │   <────────── 200 OK ──────────────┤
   │   {token, userId, name, role}       │
   │                                     │
   ├─ Store token in localStorage        │
   ├─ Redirect to MenuPage               │
   │                                     │
   ├─ GET /api/items ────────────────────>
   │   (Header: Authorization: Bearer token)
   │                                     ├─ JwtAuthFilter validates
   │   <────────── 200 OK ──────────────┤
   │   [Item[], Item[], ...]             │
   │                                     │
```

#### Order Placement Flow

```
FRONTEND                              BACKEND
   │                                     │
   ├─ POST /api/orders ──────────────────>
   │   {                                  │
   │     customerName,                    │
   │     items: [{id, quantity}],         │
   │     paymentSummary                   │
   │   }                                  │
   │                                     ├─ JwtAuthFilter validates
   │                                     ├─ Extract userId from JWT
   │                                     ├─ Validate cart not empty
   │   <────────── 201 CREATED ─────────┤
   │   OrderResponse {                   │
   │     id, status, totalAmount,        │
   │     createdAt, orderItems[]         │
   │   }                                 │
   │                                     │
   ├─ GET /api/orders/success ───────────>
   │   (Retrieve latest order)            │
   │   <────────── 200 OK ──────────────┤
   │   OrderResponse {}                  │
   │                                     │
   ├─ Redirect to SuccessPage            │
   │ (Show order confirmation)           │
   │                                     │
```

---

## 📁 Project Structure

```
HCL_Hackathon_Stack_Storm/
├── backend/                              # Spring Boot Backend
│   ├── pom.xml                          # Maven dependencies
│   ├── mvnw, mvnw.cmd                   # Maven wrapper
│   ├── src/main/java/stackStrom/com/demo/
│   │   ├── DemoApplication.java         # Entry point
│   │   ├── CorsConfig.java              # CORS configuration
│   │   ├── controller/
│   │   │   ├── AuthController.java      # Auth endpoints
│   │   │   ├── ItemController.java      # Item CRUD endpoints
│   │   │   └── OrderController.java     # Order endpoints
│   │   ├── service/
│   │   │   ├── AuthService.java         # Auth business logic
│   │   │   ├── ItemService.java         # Item business logic
│   │   │   └── OrderService.java        # Order business logic
│   │   ├── Model/                       # JPA Entities
│   │   │   ├── User.java                # User entity
│   │   │   ├── Item.java                # Item entity
│   │   │   ├── Order.java               # Order entity
│   │   │   └── OrderItem.java           # Order-Item join entity
│   │   ├── Repo/                        # Spring Data JPA Repositories
│   │   │   ├── UserRepository.java
│   │   │   ├── ItemRepository.java
│   │   │   └── OrderRepository.java
│   │   ├── dto/                         # Data Transfer Objects
│   │   │   ├── AuthDto.java             # Auth request/response
│   │   │   ├── ItemRequest.java
│   │   │   ├── OrderRequest.java
│   │   │   └── OrderResponse.java
│   │   ├── exception/                   # Custom exceptions
│   │   │   ├── GlobalExceptionHandler.java
│   │   │   ├── ItemNotFoundException.java
│   │   │   ├── OrderNotFoundException.java
│   │   │   ├── InsufficientStockException.java
│   │   │   └── InvalidOrderException.java
│   │   └── security/                    # JWT & Security
│   │       ├── JwtUtils.java            # JWT generation & validation
│   │       ├── JwtAuthFilter.java       # JWT filter for requests
│   │       └── SecurityConfig.java      # Security configuration
│   └── src/main/resources/
│       └── application.properties        # App configuration
│
├── frontend/                             # React Frontend
│   ├── package.json                     # NPM dependencies
│   ├── vite.config.js                   # Vite configuration
│   ├── index.html                       # HTML entry point
│   ├── src/
│   │   ├── main.jsx                     # React DOM render
│   │   ├── App.jsx                      # Main app component
│   │   ├── App.css                      # Global styles
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx            # Login form
│   │   │   ├── RegisterPage.jsx         # Registration form
│   │   │   ├── MenuPage.jsx             # Item browsing & admin panel
│   │   │   ├── CartPage.jsx             # Shopping cart & checkout
│   │   │   └── SuccessPage.jsx          # Order confirmation
│   │   ├── services/
│   │   │   └── api.js                   # Axios API client
│   │   └── assets/                      # Static assets
│   └── public/                          # Public static files
│
└── README.md                            # This file
```

---

## ✨ Features

### Authentication & Authorization

- ✅ User registration with email validation
- ✅ Login with JWT token generation
- ✅ Automatic session persistence
- ✅ Password hashing (BCrypt)
- ✅ Role-based access control (USER, ADMIN)
- ✅ Protected endpoints with `@PreAuthorize` annotations

### Item Management

- ✅ Browse all items or filter by category
- ✅ Real-time stock tracking
- ✅ Admin-only item creation
- ✅ Admin-only item deletion
- ✅ Categories: PIZZA, DRINK, BREAD

### Order Management

- ✅ Add items to cart (local state)
- ✅ Manage cart quantities
- ✅ Multiple payment methods (ONLINE, CASH_ON_DELIVERY)
- ✅ Automatic stock deduction on order placement
- ✅ Order history per user
- ✅ Order status tracking (PLACED, etc.)

### Security

- ✅ CORS enabled for frontend
- ✅ JWT token validation on every request
- ✅ Stateless session management
- ✅ CSRF protection disabled (JWT-based auth)
- ✅ Password encryption with BCrypt

### Error Handling

- ✅ Global exception handler
- ✅ Custom exception types
- ✅ Validation error messages
- ✅ Stock availability checks
- ✅ Duplicate email prevention

---

## 🔌 API Endpoints

### Authentication Endpoints

| Method | Endpoint             | Access        | Description           |
| ------ | -------------------- | ------------- | --------------------- |
| POST   | `/api/auth/register` | PUBLIC        | Register new user     |
| POST   | `/api/auth/login`    | PUBLIC        | Login, receive JWT    |
| GET    | `/api/auth/success`  | AUTHENTICATED | Get current user info |

### Item Endpoints

| Method | Endpoint                    | Access | Description        |
| ------ | --------------------------- | ------ | ------------------ |
| GET    | `/api/items`                | PUBLIC | Get all items      |
| GET    | `/api/items?category=PIZZA` | PUBLIC | Filter by category |
| POST   | `/api/items`                | ADMIN  | Create new item    |
| DELETE | `/api/items/{id}`           | ADMIN  | Delete item        |

### Order Endpoints

| Method | Endpoint              | Access        | Description       |
| ------ | --------------------- | ------------- | ----------------- |
| POST   | `/api/orders`         | AUTHENTICATED | Place new order   |
| GET    | `/api/orders`         | AUTHENTICATED | Get user's orders |
| GET    | `/api/orders/{id}`    | AUTHENTICATED | Get order by ID   |
| GET    | `/api/orders/success` | AUTHENTICATED | Get latest order  |

### Request/Response Examples

**POST /api/auth/register**

```json
Request:
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}

Response (201 Created):
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "role": "USER"
}
```

**POST /api/orders**

```json
Request:
{
  "customerName": "John Doe",
  "items": [
    {"itemId": 1, "quantity": 2},
    {"itemId": 3, "quantity": 1}
  ],
  "paymentSummary": "ONLINE / PAID / UPI / John Doe / john@upi / REF TXN123"
}

Response (201 Created):
{
  "id": 5,
  "customerName": "John Doe",
  "totalAmount": 659.00,
  "status": "PLACED",
  "createdAt": "2026-04-18T10:30:00",
  "orderItems": [
    {
      "itemId": 1,
      "itemName": "Margherita Pizza",
      "quantity": 2,
      "price": 249.00
    },
    {
      "itemId": 3,
      "itemName": "Pepsi",
      "quantity": 1,
      "price": 50.00
    }
  ]
}
```

---

## 🗄️ Database Schema

### Users Table

```sql
CREATE TABLE users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,  -- BCrypt hashed
  role VARCHAR(50) DEFAULT 'USER'  -- USER or ADMIN
);
```

### Items Table

```sql
CREATE TABLE items (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL,   -- PIZZA, DRINK, BREAD
  price DOUBLE NOT NULL,
  stock INT NOT NULL
);
```

### Orders Table

```sql
CREATE TABLE orders (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  total_amount DOUBLE NOT NULL,
  status VARCHAR(50) DEFAULT 'PLACED',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### OrderItems Table (Join Table)

```sql
CREATE TABLE order_items (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  order_id BIGINT NOT NULL,
  item_id BIGINT NOT NULL,
  quantity INT NOT NULL,
  price DOUBLE NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (item_id) REFERENCES items(id)
);
```

---

## 🚀 Installation & Setup

### Prerequisites

- **Java 17+** installed
- **Node.js 16+** and npm installed
- **Git** for version control
- A terminal/command prompt

### Backend Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/HCL_Hackathon_Stack_Storm.git
   cd HCL_Hackathon_Stack_Storm/backend
   ```

2. **Install dependencies using Maven**

   ```bash
   # On Linux/Mac
   ./mvnw clean install

   # On Windows
   mvnw.cmd clean install
   ```

3. **Configure application (optional)**
   - Open `src/main/resources/application.properties`
   - Default configuration uses H2 embedded database (no setup needed)
   - Server runs on `http://localhost:8080`

### Frontend Setup

1. **Navigate to frontend directory**

   ```bash
   cd ../frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configuration**
   - Frontend API endpoint is hardcoded to `http://localhost:8080` in `src/services/api.js`
   - Ensure backend is running before starting frontend

---

## ▶️ Running the Application

### Start the Backend

```bash
cd backend

# Using Maven wrapper
./mvnw spring-boot:run        # Linux/Mac
mvnw.cmd spring-boot:run      # Windows

# Or run the JAR directly after building
mvn clean package
java -jar target/demo-0.0.1-SNAPSHOT.jar
```

**Expected Output:**

```
Started DemoApplication in 3.456 seconds
Tomcat started on port(s): 8080
```

### Start the Frontend

```bash
cd frontend

# Development mode with Vite
npm run dev

# Output will show:
# ➜ Local: http://localhost:5173
```

### Access the Application

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8080
- **H2 Database Console:** http://localhost:8080/h2-console

---

## 📖 Usage Examples

### Scenario 1: Regular User - Browse & Order

1. **Register**
   - Click "Switch to Register"
   - Enter name, email, password
   - Submit

2. **Browse Menu**
   - Auto-redirected to MenuPage
   - View all items (PIZZA, DRINK, BREAD)
   - Filter by category

3. **Add to Cart**
   - Click "Add to Cart" on items
   - Adjust quantities with +/- buttons

4. **Checkout**
   - Click "Go to Cart"
   - Enter delivery details
   - Choose payment method
   - Click "Place Order"

5. **View Confirmation**
   - Order summary displayed
   - Click "View Orders" to see history

### Scenario 2: Admin - Manage Inventory

1. **Login as Admin**
   - Email: `admin@retailbite.com`
   - Password: `admin123`

2. **Add New Item**
   - On MenuPage, scroll to "Admin Panel"
   - Fill: name, category, price, stock
   - Click "Add Item"

3. **Delete Item**
   - In item list, click "Delete" button
   - Item removed from inventory

4. **Browse as Customer**
   - Admin can also place orders like regular users

### Scenario 3: Insufficient Stock

1. **Attempt large quantity**
   - Add item with quantity > available stock
   - Frontend won't prevent it (handled by backend)

2. **Place Order**
   - Backend validates stock
   - If insufficient: `InsufficientStockException` returned
   - Error message displayed to user

---

## 🔐 Authentication & Security

### JWT Token Structure

```
Header.Payload.Signature
```

**Payload contains:**

- `sub` (userId)
- `email` (user email)
- `role` (USER or ADMIN)
- `iat` (issued at)
- `exp` (expiration - 24 hours)

### Token Flow

1. User registers/logs in
2. Backend validates credentials
3. JWT generated with userId, email, role
4. Frontend stores token in localStorage
5. Every request includes `Authorization: Bearer <token>`
6. JwtAuthFilter validates token on backend
7. If invalid/expired: 401 Unauthorized

### Password Security

- Passwords hashed with BCrypt (strength 10)
- Never stored in plaintext
- Validated on each login

### CORS Configuration

- Frontend (http://localhost:3000 or :5173) can access backend
- Enabled on all controllers with `@CrossOrigin`

---

## ❌ Error Handling

### Global Exception Handler

All errors return structured JSON responses:

```json
{
  "timestamp": "2026-04-18T10:30:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Insufficient stock for item ID 1",
  "path": "/api/orders"
}
```

### Common Error Codes

| Status | Error                        | Cause                           |
| ------ | ---------------------------- | ------------------------------- |
| 400    | `InvalidOrderException`      | Missing/invalid order data      |
| 400    | `InsufficientStockException` | Item stock too low              |
| 404    | `ItemNotFoundException`      | Item ID doesn't exist           |
| 404    | `OrderNotFoundException`     | Order not found for user        |
| 409    | `Email already registered`   | Duplicate email on registration |
| 401    | `Unauthorized`               | Invalid/expired JWT token       |
| 403    | `Access Denied`              | Insufficient role (not ADMIN)   |

---

## 🧪 Testing

### Manual API Testing with cURL

**Register User:**

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Login:**

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Get Items (save token from login response):**

```bash
curl -X GET http://localhost:8080/api/items
```

**Place Order (with token):**

```bash
curl -X POST http://localhost:8080/api/orders \
  -H "Authorization: Bearer <TOKEN_FROM_LOGIN>" \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "Test User",
    "items": [{"itemId": 1, "quantity": 2}],
    "paymentSummary": "ONLINE / PAID / UPI / Test / test@upi / REF TX123"
  }'
```

---

## 🐛 Troubleshooting

### Backend Won't Start

- **Issue:** Port 8080 already in use
- **Solution:** Kill process or change `server.port` in application.properties

### Frontend Can't Connect to Backend

- **Issue:** CORS error or connection refused
- **Solution:** Ensure backend running on :8080, check `api.js` baseURL

### H2 Database Errors

- **Issue:** "Database file is locked"
- **Solution:** Delete `./test.mv.db` and restart

### JWT Token Expired

- **Issue:** 401 error on requests
- **Solution:** Login again to get new token

---

## 📚 Additional Resources

- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [React Documentation](https://react.dev)
- [JWT.io](https://jwt.io) - JWT explanation and decoder
- [Spring Security](https://spring.io/projects/spring-security)

---

## 📝 License

This project is part of the HCL Hackathon. Licensed under MIT License.

---

## 👥 Team & Credits

**HCL Hackathon - Stack Storm Team**

Built with ❤️ during Sprint 0 of the HCL Hackathon Challenge.

---

## 📞 Support

For questions or issues:

1. Check [Troubleshooting](#troubleshooting) section
2. Review [API Endpoints](#api-endpoints) documentation
3. Open an issue on GitHub

---

**Happy Coding! 🚀**
