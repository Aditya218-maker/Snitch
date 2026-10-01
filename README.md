# Snitch

A full-stack fashion e-commerce web app built with the MERN stack. Buyers can browse products, add items to a cart and pay online with Razorpay. Sellers can list products with multiple variants and images.

Features

Built a REST API with Express and MongoDB, with email/password and Google login, JWT cookies, and buyer/seller role-based access
Calculated cart totals on the server using MongoDB aggregation pipelines, so prices can't be tampered with from the browser
Integrated Razorpay payments with server-side signature verification
Handled image uploads with Multer and ImageKit; built the frontend with React, Redux Toolkit and Tailwind

For everyone

Register and log in with email and password, or with Google
Browse all products and open a product detail page
Session kept with a JWT stored in a cookie

For buyers

Add product variants to the cart (stock is checked before adding)
Increase item quantity in the cart
Pay with Razorpay (test mode); the payment signature is verified on the server
Order success page after payment

For sellers

Register as a seller
Create products with up to 7 images (uploaded to ImageKit)
Add variants to a product (images, price, stock, attributes such as size or colour)
Seller dashboard showing only your own products

Under the hood

Cart totals are calculated on the server from database prices, so the browser cannot change the price
Role-based route protection on both backend and frontend
Request validation with express-validator

Project Structure
Snitch/
├── Backend/
│   ├── server.js                 # starts the server and connects to MongoDB
│   └── src/
│       ├── app.js                # Express app, middleware, routes, Google strategy
│       ├── config/               # env loading and database connection
│       ├── routes/               # auth, product, cart routes
│       ├── controllers/          # request handlers
│       ├── dao/                  # database queries (cart aggregation, stock)
│       ├── services/             # Razorpay and ImageKit helpers
│       ├── middlewares/          # authenticateUser, authenticateSeller
│       ├── models/               # user, product, cart, payment, price schema
│       └── validator/            # request validation rules
└── Frontend/
    └── src/
        ├── app/                  # router, store, layout
        └── features/
            ├── auth/             # login, register, Google button, protected routes
            ├── products/         # home, product detail, seller pages
            ├── cart/             # cart page, order success
            └── Shared/           # navbar

The frontend is organised by feature, and each feature has its own pages, service (API calls), state (Redux slice) and hook folders.

Getting Started
Prerequisites
Node.js 18 or newer
A MongoDB database (MongoDB Atlas free tier works)
A Google OAuth client (Google Cloud Console)
A Razorpay account (test mode keys)
An ImageKit account
1. Clone the repo
bash
git clone https://github.com/Aditya218-maker/Snitch.git
cd Snitch
2. Set up the backend
bash
cd Backend
npm install

Create a file named .env inside Backend/:

env
PORT=3000
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=a_long_random_secret

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=your_imagekit_url_endpoint

RAZORPAY_KEY_ID=your_razorpay_test_key_id
RAZORPAY_KEY_SECRET=your_razorpay_test_key_secret

In the Google Cloud Console, add this as an authorised redirect URI:

http://localhost:3000/api/auth/google/callback

Start the backend:

bash
npm run dev

It runs on http://localhost:3000.

3. Set up the frontend
bash
cd ../Frontend
npm install

Open src/features/cart/pages/Cart.jsx and replace the Razorpay key value with your own test key ID (the same value as RAZORPAY_KEY_ID).

Start the frontend:

bash
npm run dev

It runs on http://localhost:5173. Vite forwards every /api request to the backend on port 3000, so no extra proxy setup is needed.

4. Try it out
Register one account as a seller and create a product, then add a variant (a product needs at least one variant to be bought).
Register a second account as a buyer, add the variant to the cart and check out.
In Razorpay test mode, use the test card details from the Razorpay docs.
API Overview

Auth (/api/auth)

Method	Route	Description	Access
POST	/register	Create an account (buyer or seller)	Public
POST	/login	Log in	Public
GET / POST	/logout	Log out	Public
GET	/google	Start Google login	Public
GET	/google/callback	Google login callback	Public
GET	/me	Get the logged-in user	Logged in

Products (/api/products)

Method	Route	Description	Access
GET	/	List all products	Public
GET	/detail/:id	Product details	Public
POST	/	Create a product (with images)	Seller
GET	/seller	List my products	Seller
POST	/:productId/variants	Add a variant	Seller

Cart and payments (/api/cart)

Method	Route	Description	Access
GET	/	Get my cart with totals	Logged in
POST	/add/:productId/:variantId	Add a variant to the cart	Logged in
PATCH	/quantity/increment/:productId/:variantId	Increase quantity by one	Logged in
POST	/payment/create/order	Create a Razorpay order	Logged in
POST	/payment/verify/order	Verify the payment signature	Logged in
Payment Flow
The buyer clicks checkout, and the backend calculates the total from the cart and creates a Razorpay order.
The Razorpay popup opens in the browser and the buyer pays.
Razorpay returns an order ID, payment ID and signature to the browser.
The browser sends these to the backend, which verifies the signature with the secret key and marks the payment as paid.

A diagram of this flow is in razorpay-flow.png.

Limitations and Roadmap

This project currently covers the core buying and selling flow. Planned next steps:

 Reduce stock, clear the cart and create an order record after a successful payment
 Order history for buyers and an orders view for sellers
 Edit and delete products, and remove items from the cart
 Shipping address and order status (placed, shipped, delivered)
 Search, filters and pagination on the product list
 Razorpay webhook for payments that complete after the browser closes
 Harden cookies (httpOnly, secure, sameSite), add rate limiting and helmet
 Move hardcoded localhost URLs and the Razorpay key to environment variables
 Automated tests
