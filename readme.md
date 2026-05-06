# DELIGO – Unified Campus Delivery Platform

A full-stack campus delivery platform built using React and Django that enables students, teaching staff, and non-teaching staff to order food and stationery products within a college campus ecosystem.

The platform supports multi-vendor ordering, role-based authentication, campus-restricted delivery zones, payment integration, order tracking, notifications, and delivery partner management.

---

# 🚀 Features

## 🔐 Authentication & Authorization

* Role-based authentication system
* Roles Supported:

  * Admin
  * Vendor
  * Customer
  * Delivery Partner
* Secure login and registration
* Django authentication system with RBAC

---

## 🛍 Product Management

Vendors can:

* Add products
* Update products
* Delete products
* Upload product images
* Manage categories and subcategories

### Product Categories

#### 🍔 Food

* Breakfast
* Lunch
* Beverages

#### 📝 Stationery

* Writing Supplies
* Notebooks
* Office Supplies

---

## 🛒 Cart System

Customers can:

* Add items to cart
* Remove items from cart
* Update item quantities
* Order products from multiple vendors
* View dynamically calculated total price

---

## 📦 Order Management

* Single order can contain:

  * Food items
  * Stationery items
* Unique alphanumeric Order ID generation
* Complete order lifecycle support

### Order Status Workflow

```text
Placed → Accepted → Preparing → Ready → Out for Delivery → Delivered → Cancelled
```

---

## 🚚 Campus Delivery Restriction

Orders are allowed only inside approved campus delivery zones such as:

* Hostels
* Academic Blocks
* Departments
* Library

Orders outside allowed campus zones are automatically rejected.

---

## 💳 Payment Integration

* Razorpay integration
* Secure payment processing
* Payment status tracking
* Order linked with payment ID

---

## 🔔 Notification System

Notifications are triggered for:

* Order placed
* Order accepted
* Preparing
* Ready for pickup
* Out for delivery
* Delivered

Supports:

* Email notifications
* Database notifications

---

## 📞 Delivery Partner Support

* Assign delivery partners to orders
* Call delivery partner directly from frontend
* Delivery status tracking

---

## ⭐ Ratings & Reviews

Customers can:

* Rate products (1–5)
* Submit reviews after delivery
* View average product ratings

---

## 🧑‍💼 Admin Dashboard

Admin can manage:

* Users
* Vendors
* Products
* Orders
* Campus zones
* Delivery operations

---

# 🏗 Tech Stack

## Frontend

* React
* HTML5
* CSS3
* JavaScript
* Vite

---

## Backend

* Django
* Django REST Framework

---

## Database

* SQLite (Development)
* MySQL/PostgreSQL (Future Scalability)

---

## Authentication & Security

* Django Authentication
* Role-Based Access Control (RBAC)
* CSRF Protection
* Password Hashing

---

# 📁 Project Structure

```text
DELIGO/
│
├── backend/
│   ├── accounts/
│   ├── campus/
│   ├── cart/
│   ├── deligo_backend/
│   ├── media/
│   ├── notifications/
│   ├── orders/
│   ├── payments/
│   ├── products/
│   ├── vendors/
│   ├── db.sqlite3
│   ├── manage.py
│   └── requirements.txt
│
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
│
└── README.md
```

---

# ⚙️ Installation Guide

# 1️⃣ Clone Repository

```bash
git clone <repository-url>
cd DELIGO
```

---

# 2️⃣ Backend Setup

```bash
cd backend
```

## Create Virtual Environment

### Windows

```bash
python -m venv venv
venv\Scripts\activate
```

### Linux/Mac

```bash
python3 -m venv venv
source venv/bin/activate
```

---

## Install Dependencies

```bash
pip install -r requirements.txt
```

---

## Run Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

---

## Create Superuser

```bash
python manage.py createsuperuser
```

---

## Start Backend Server

```bash
python manage.py runserver
```

Backend runs on:

```text
http://127.0.0.1:8000/
```

---

# 3️⃣ Frontend Setup

Open a new terminal:

```bash
cd frontend
```

## Install Dependencies

```bash
npm install
```

---

## Start Frontend

```bash
npm run dev
```

Frontend runs on:

```text
http://localhost:5173/
```

---

# 🔑 Environment Variables

Create a `.env` file for sensitive keys.

Example:

```env
SECRET_KEY=your_django_secret_key

DEBUG=True

RAZORPAY_KEY_ID=your_key
RAZORPAY_KEY_SECRET=your_secret

EMAIL_HOST_USER=your_email
EMAIL_HOST_PASSWORD=your_password
```

---

# 📡 API Modules

The backend is divided into multiple Django apps:

| Module        | Purpose                  |
| ------------- | ------------------------ |
| accounts      | Authentication & roles   |
| vendors       | Vendor management        |
| products      | Product management       |
| cart          | Shopping cart            |
| orders        | Order handling           |
| payments      | Razorpay integration     |
| notifications | Notifications system     |
| campus        | Campus zone restrictions |



