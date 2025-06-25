Grailify Grailify
The premier online marketplace for authentic sneakers, apparel, and collectibles. Built with a powerful Go backend and a responsive Next.js frontend.
Replace the URL above with a real screenshot of your application's homepage!
✨ Core Features
Grailify is a full-featured e-commerce platform that allows users to both buy and sell high-value items.
👤 General & Buyer Features
Secure User Accounts: JWT-based authentication for user sign-up and login.
Dynamic Homepage: Features trending items in different categories to drive engagement.
Advanced Search: Live, debounced search functionality for instant results.
Product Browsing: Filter products by category with pagination.
Detailed Product Pages: View item details, image, description, and price history chart.
Merged Inventory: Product pages seamlessly display inventory from both the main store and third-party sellers, sorted by price.
Out-of-Stock Indicators: All possible sizes for a category are shown, with unavailable sizes clearly marked.
Shopping Cart: Add items to a persistent cart managed with localStorage.
Light/Dark Mode: A theme toggle for user viewing comfort.
💰 Seller Features
User Profile Page: A central dashboard to manage account details.
Active Listings Management: Sellers can view a list of only their own active items for sale.
Create Listings: A dedicated "Sell" page to list new items for sale in the marketplace.
Edit & Remove Listings: Full CRUD functionality for sellers to manage the price, stock, or remove their listings.
🛠️ Tech Stack
This project is a monorepo containing a separate frontend and backend.
Area	Technology	Description
Frontend	Next.js / React	A modern React framework for building fast, server-rendered applications.
TypeScript	For static typing and a more robust codebase.
Tailwind CSS	A utility-first CSS framework for rapid UI development.
Framer Motion	For fluid, performant animations and transitions.
Backend	Go (Golang)	A statically typed, compiled language known for its performance and concurrency.
Gorilla Mux	A powerful URL router and dispatcher for Go.
MySQL	The relational database used for storing all application data.
JWT	JSON Web Tokens for handling secure user authentication.
🚀 Getting Started
To get a local copy up and running, follow these simple steps.
Prerequisites
Go: Version 1.18 or higher.
Node.js: Version 18.x or higher.
MySQL: A running instance of a MySQL server.
1. Clone the Repository
Generated bash
git clone https://github.com/your-username/grailify.git
cd grailify
Use code with caution.
Bash
2. Backend Setup
First, set up the database and run the Go server.
Create the Database: Connect to your MySQL instance and create the database.
Generated sql
CREATE DATABASE grailify;
Use code with caution.
SQL
Import Schema & Data: Import the provided .sql file to create the tables and populate initial data.
Navigate to Backend:
Generated bash
cd backend
Use code with caution.
Bash
Install Dependencies:
Generated bash
go mod tidy
Use code with caution.
Bash
Configure Database Connection: Open internal/database/mysql.go and update the DSN string with your MySQL username and password.
Generated go
// Example DSN string
dsn := fmt.Sprintf("YOUR_USERNAME:YOUR_PASSWORD@tcp(127.0.0.1:3306)/grailify?parseTime=true")
Use code with caution.
Go
Run the Backend Server:
Generated bash
go run main.go
Use code with caution.
Bash
The backend will be running on http://localhost:8080.
3. Frontend Setup
Now, set up and run the Next.js frontend in a separate terminal.
Navigate to Frontend:
Generated bash
cd grailify-frontend
Use code with caution.
Bash
Install Dependencies:
Generated bash
npm install
Use code with caution.
Bash
Run the Frontend Server:
Generated bash
npm run dev
Use code with caution.
Bash
The frontend will be running on http://localhost:3000. Open this URL in your browser to see the application!
🔌 API Endpoints
The Go backend exposes the following RESTful API endpoints.
Endpoint	Method	Description	Protected?
/api/signup	POST	Registers a new user.	No
/api/login	POST	Logs in a user and returns a JWT.	No
/api/items	GET	Gets a paginated list of items by category.	No
/api/item	GET	Gets detailed information for a single item.	No
/api/categories	GET	Gets a list of all product categories.	No
/api/search	GET	Searches for items by name or brand.	No
/api/trending	GET	Gets top trending sneakers and apparel.	No
/api/profile	GET	Gets the current user's profile data.	Yes
/api/listings	POST	Creates a new listing for an item.	Yes
/api/listings/{id}	PUT	Updates a user's existing listing.	Yes
/api/listings/{id}	DELETE	Removes a user's existing listing.	Yes
/api/orders	POST	Creates a new order.	Yes
🗂️ Database Schema
The database consists of several related tables to manage users, products, and transactions:
users: Stores user account information and credentials.
items: The master list of all products that can be sold.
categories: Defines product categories (Sneakers, Apparel, etc.).
item_inventory: The core table that holds all listings from both the store (user_id is NULL) and sellers (user_id is set).
orders & order_items: Manages customer order history.
price_history: Tracks the sale prices of items over time.
sizes: A lookup table for all possible product sizes.
user_addresses & user_payment_methods: Stores user-specific profile data.
💡 Future Improvements
Implement a real payment gateway like Stripe.
Add an admin dashboard to manage users and products.
Introduce a user rating and review system.
Add more advanced search filters (by size, price range, brand).
