
# 🏥 Multi-Vendor Medicine Selling Platform (Backend)

[![Node.js](https://img.shields.io/badge/Node.js-18.0-green?logo=node.js)](https://nodejs.org/)  
[![Express](https://img.shields.io/badge/Express-5.1.0-black?logo=express)](https://expressjs.com/)  
[![MongoDB](https://img.shields.io/badge/MongoDB-6.18.0-brightgreen?logo=mongodb)](https://www.mongodb.com/)  
[![Firebase Admin](https://img.shields.io/badge/Firebase--Admin-13.4.0-yellow?logo=firebase)](https://firebase.google.com/)  
[![Stripe](https://img.shields.io/badge/Stripe-18.4.0-purple?logo=stripe)](https://stripe.com/)  
[![CORS](https://img.shields.io/badge/CORS-2.8.5-blue)](https://www.npmjs.com/package/cors)  
[![dotenv](https://img.shields.io/badge/dotenv-17.2.1-green)](https://www.npmjs.com/package/dotenv)  


## 🔹 Project Overview

This is the **backend** for a **MERN stack multi-vendor medicine selling platform**.  

- Users can browse medicines by category, add them to the cart, and make payments via Stripe.  
- Admins and sellers have dashboards for managing users, medicines, categories, and sales.  
- The backend provides secure APIs with **Firebase authentication** and **JWT verification**.

---


## Features

- **User Management**: Registration, role assignment (Admin/Seller/Buyer)
- **Medicine CRUD**: Add/update/delete medicines with categories
- **Shopping System**: Cart functionality with quantity management
- **Payment Gateway**: Stripe integration for secure payments
- **Sales Tracking**: Separate collections for seller sales and buyer purchases
- **Advertisement System**: Manage promotional content
- **Analytics**: Medicine counts, category statistics, and top discounts




## Technologies
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (MongoDB Atlas)
- **Authentication**: Firebase Admin SDK
- **Payments**: Stripe API
- **Middleware**: CORS, dotenv



---

## 🔹 Features

### User Features
- ✅ Registration and login with Firebase authentication (Email/password, Google, GitHub)  
- ✅ Role-based access: user or seller  
- ✅ Add medicines to cart and checkout with Stripe payment  
- ✅ View purchased medicines and payment history  

### Seller Features
- ✅ Add, update, and manage medicines  
- ✅ Track sold items and payment status  
- ✅ Submit medicines for homepage advertisement  

### Admin Features
- ✅ Manage users (upgrade/downgrade roles)  
- ✅ Manage categories (add, update, delete)  
- ✅ View sales reports and payment history  
- ✅ Manage homepage advertisements  

### General Features
- ✅ Role-based private routes  
- ✅ Firebase token verification for secure APIs  
- ✅ CRUD operations for medicines, cart, categories, users, and advertisements  
- ✅ Fully responsive backend for API consumption  
- ✅ Environment variables to store sensitive data  

---

## API Documentation

### Authentication
All protected routes require a Firebase JWT token in the Authorization header:



### Key Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST   | `/users` | Register new user | Public |
| GET    | `/users/:uid` | Get all users | Admin |
| GET    | `/all-medicines` | Get paginated medicines | Public |
| POST   | `/medicines` | Add new medicine | Seller |
| GET    | `/cart-medicines/:userId` | Get user cart | Owner |
| POST   | `/create-chechout-session` | Create Stripe payment | Authenticated |

## API Endpoints

### User Routes
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `POST` | `/users` | Register new user | Public |
| `GET` | `/users/:uid` | Get all users | Admin |
| `GET` | `/users-role/:uid` | Get user role | Authenticated |

### Medicine Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/all-medicines` | Paginated medicines with search/sort |
| `GET` | `/category-medicine/:category` | Medicines by category |
| `GET` | `/saler-medicine/:uid` | Medicines by seller |
| `POST` | `/medicines` | Add new medicine |
| `GET` | `/medicineCount` | Total medicine count |
| `GET` | `/top-discounted` | Top 10 discounted medicines |

### Category Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/get-category` | List all categories |
| `POST` | `/category` | Add new category |
| `PATCH` | `/update-category/:id` | Update category |
| `DELETE` | `/delete-category/:id` | Delete category |
| `GET` | `/category-count/:category` | Count medicines in category |

### Cart & Purchase Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/cart-medicines/:userId` | Get user cart |
| `POST` | `/cart/:userId` | Add to cart |
| `PATCH` | `/incOrDec-cat-quantity/:id` | Update item quantity |
| `DELETE` | `/delete-cart/:userId` | Clear cart |
| `POST` | `/user-purchased-items/:userId` | Record purchase |
| `POST` | `/saler-sold-items/:userId` | Record sale |

### Payment Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/create-chechout-session` | Create Stripe payment |

### Advertisement Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/get-all-advertisement` | List all ads |
| `POST` | `/add-advertisement` | Create new ad |
| `PATCH` | `/add-ad-to-slide/:id` | Update ad status |

## Database Collections
1. **users**  
   - Fields: `uid`, `email`, `username`, `role`, `photoURL`, `createdAt`

2. **medicines**  
   - Fields: `name`, `genericName`, `category`, `price`, `discount`, `saler` (uid/email), etc.

3. **categories**  
   - Fields: `categoryName`, `categoryImage`, `noOfMedicine`

4. **cart**  
   - Fields: `userId`, `medicines[]`, `createdAt`

5. **sold** (Seller sales)  
   - Fields: `userId`, `soldItems[]`, `createdAt`

6. **purchased** (Buyer history)  
   - Fields: `userId`, `purchasedItem[]`, `purchasedAt`

7. **advertisement**  
   - Fields: `image`, `title`, `status`, `added_by`


## Authentication
   - Uses Firebase JWT tokens

---- 

## 🔒 Authentication
    -  Authorization: Bearer <firebase_token>


## Error Handling
| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not found | 
| 500 | Server error |



# Deployment

## MongoDB Atlas Setup:

 ### Create cluster
 ### Whitelist IP addresses
 ### Get connection URI



 
## Setup

1. Clone the repository:
   - ```bash
   - git clone https://github.com/yourusername/medicine-sell-platform.git
   - cd medicine-sell-platform
2. Install dependencies:
   - npm install

3. Set up Firebase

  -  Create a Firebase project
  -  Generate service account key (JSON)
  -  Base64 encode it for FIREBASE_SERVICE_KEY
4. Configure Stripe:
  - Get your secret key from Stripe Dashboard

5. Run the server:
   - node index.js
   - or install nodemon and run nodemon index.js

6. Create .env file:

   - DB_USER=your_mongodb_atlas_username
   - DB_PASS=your_mongodb_atlas_password
   - STRIPE_SECRET_KEY=your_stripe_secret_key
   - FIREBASE_SERVICE_KEY=base64_encoded_service_account

