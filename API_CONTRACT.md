# NS Choco Delight — API Contract Specification

This document defines the authoritative request and response payload schemas across all API endpoints to prevent field mismatches between frontend components and backend Mongoose models.

---

## 1. Authentication (`/api/auth`)

### `POST /api/auth/register`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "Password123!",
    "phone": "9876543210",
    "adminSecret": "chocoAdmin2024" // Optional: assigns admin role if matches ADMIN_SECRET
  }
  ```
- **Success Response (201 Created)**:
  ```json
  {
    "success": true,
    "token": "eyJhbGciOi...",
    "user": {
      "_id": "65b...",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "9876543210",
      "role": "customer"
    }
  }
  ```

### `POST /api/auth/login`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "email": "john@example.com",
    "password": "Password123!"
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "token": "eyJhbGciOi...",
    "user": {
      "_id": "65b...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "customer"
    }
  }
  ```

---

## 2. Products (`/api/products`)

### `GET /api/products`
- **Access**: Public
- **Query Parameters**:
  - `search` (string): Search term matched against `name` and `description`.
  - `category` (string): `'Normal Shape or Heart'` or `'Bites'`.
  - `sort` (string): `'newest'`, `'price_asc'`, `'price_desc'`, `'rating'`.
  - `page` (number), `limit` (number).
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "total": 12,
    "page": 1,
    "pages": 1,
    "products": [
      {
        "_id": "65c...",
        "name": "Pistachio Kunafa Chocolate",
        "description": "Luxurious pistachio kunafa chocolate bar",
        "category": "Normal Shape or Heart",
        "shapeOptions": ["Normal", "Heart"],
        "price": 260,
        "stock": 50,
        "images": ["/uploads/image1.png"],
        "ratingAverage": 4.8,
        "numReviews": 15,
        "isFeatured": true,
        "isAvailable": true
      }
    ]
  }
  ```

### `POST /api/products`
- **Access**: Protected (Admin Only)
- **Content-Type**: `multipart/form-data`
- **Form Fields**: `name`, `description`, `category`, `price`, `stock`, `isFeatured`, `shapeOptions` (JSON string array), `images` (File array).

---

## 3. Product Reviews (`/api/products/:id/reviews`)

### `POST /api/products/:id/reviews`
- **Access**: Protected (Delivered-Order Customers)
- **Request Body**:
  ```json
  {
    "rating": 5,
    "comment": "Amazing quality and packaging!",
    "orderId": "65d..." // Optional
  }
  ```
- **Success Response (201 Created)**:
  ```json
  {
    "success": true,
    "review": {
      "_id": "65e...",
      "user": { "_id": "65b...", "name": "John Doe" },
      "product": "65c...",
      "rating": 5,
      "comment": "Amazing quality and packaging!",
      "createdAt": "2026-08-22T10:00:00.000Z"
    }
  }
  ```

---

## 4. Special Occasion Campaigns (`/api/campaigns`)

### `GET /api/campaigns/active`
- **Access**: Public
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "campaigns": [
      {
        "_id": "65f...",
        "title": "Hello Love",
        "occasion": "Valentines",
        "description": "Romantic handcrafted chocolates for your loved ones",
        "bannerImageUrl": "/uploads/banner.jpg",
        "products": [ ... ],
        "hampers": [ ... ],
        "isActive": true
      }
    ]
  }
  ```
