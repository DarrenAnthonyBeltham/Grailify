# Grailify  

> The premier online marketplace for authentic sneakers, apparel, and collectibles. Built with a powerful Go backend and a responsive Next.js frontend.


*Replace the URL above with a real screenshot of your application's homepage!*

## ✨ Core Features

Grailify is a full-featured e-commerce platform that allows users to both buy and sell high-value items.

### 👤 General & Buyer Features
- **Secure User Accounts:** JWT-based authentication for user sign-up and login.
- **Dynamic Homepage:** Features trending items in different categories to drive engagement.
- **Advanced Search:** Live, debounced search functionality for instant results.
- **Product Browsing:** Filter products by category with pagination.
- **Detailed Product Pages:** View item details, image, description, and price history chart.
- **Merged Inventory:** Product pages seamlessly display inventory from both the main store and third-party sellers, sorted by price.
- **Out-of-Stock Indicators:** All possible sizes for a category are shown, with unavailable sizes clearly marked.
- **Shopping Cart:** Add items to a persistent cart managed with `localStorage`.

### 💰 Seller Features
- **User Profile Page:** A central dashboard to manage account details.
- **Active Listings Management:** Sellers can view a list of only *their own* active items for sale.
- **Create Listings:** A dedicated "Sell" page to list new items for sale in the marketplace.
- **Edit & Remove Listings:** Full CRUD functionality for sellers to manage the price, stock, or remove their listings.

## 🛠️ Tech Stack

This project is a monorepo containing a separate frontend and backend.

| Area | Technology | Description |
|---|---|---|
| **Frontend** | [**Next.js**](https://nextjs.org/) / [**React**](https://reactjs.org/) | A modern React framework for building fast, server-rendered applications. |
| | [**TypeScript**](https://www.typescriptlang.org/) | For static typing and a more robust codebase. |
| | [**Tailwind CSS**](https://tailwindcss.com/) | A utility-first CSS framework for rapid UI development. |
| | [**Framer Motion**](https://www.framer.com/motion/) | For fluid, performant animations and transitions. |
| **Backend** | [**Go (Golang)**](https://golang.org/) | A statically typed, compiled language known for its performance and concurrency. |
| | [**Gorilla Mux**](https://github.com/gorilla/mux) | A powerful URL router and dispatcher for Go. |
| | [**MySQL**](https://www.mysql.com/) | The relational database used for storing all application data. |
| | [**JWT**](https://jwt.io/) | JSON Web Tokens for handling secure user authentication. |

Link for the SQL: https://drive.google.com/file/d/1fFJlZVQ1-b7VYsCdJgmZOajViqs7lUqt/view?usp=sharing
