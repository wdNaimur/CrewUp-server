# CrewUp Backend

Backend server for **CrewUp**, a community-driven platform to discover, join, and manage local hobby-based groups. This server handles group creation, bookings, user-specific data, and API endpoints.

---

## 🚀 Tech Stack

- **Node.js & Express** – Web server framework  
- **MongoDB** – NoSQL database  
- **MongoDB Node.js Driver** – For MongoDB operations  
- **dotenv** – Environment variable management  
- **CORS** – Cross-origin request handling  

---

## 🔐 Key Features

- RESTful APIs for user management, group creation, and bookings  
- User overview dashboard with created groups and bookings counts  
- Searchable and sortable group listings  
- Category-based group browsing  
- Booking system with duplicate booking prevention  
- Input validation and error handling  
- Environment-based secure config via `.env`  

---

## 🔥 API Endpoints

### 👤 Users

| Method | Endpoint | Description                          |
|--------|-----------|------------------------------------|
| POST   | `/users`  | Create a new user or update existing user info |

### 📊 Overview

| Method | Endpoint   | Description                                   |
|--------|------------|-----------------------------------------------|
| GET    | `/overview`| Get counts of groups created and bookings made by a user (via `email` query param) |

### 📁 Groups

| Method | Endpoint                | Description                                |
|--------|-------------------------|--------------------------------------------|
| GET    | `/groups`               | Get all groups with optional sorting and searching  |
| GET    | `/myGroup`              | Get groups created by a specific user (via `email` query param) including their bookings |
| GET    | `/groups/featured`      | Get up to 6 upcoming active groups         |
| GET    | `/groups/:id`           | Get a single group by ID including bookings and if user already booked (requires `email` query param) |
| GET    | `/categories/:category` | Get groups by category                      |
| POST   | `/groups`               | Create a new group                         |
| PATCH  | `/groups/:id`           | Update group by ID with validation on max members |
| DELETE | `/groups/:id`           | Delete a group by ID                       |

### 📌 Bookings

| Method | Endpoint         | Description                               |
|--------|------------------|-------------------------------------------|
| GET    | `/myBookings`    | Get bookings made by a user (via `email` query param) including group details |
| POST   | `/bookings`      | Create a new booking with duplicate check |
| DELETE | `/bookings/:id`  | Delete a booking by ID                    |

---

## 📦 Dependencies

`express`, `mongodb`, `cors`, `dotenv`

---

## 🛠️ CrewUp Server – Local Setup Instructions

- **Clone the repository and install dependencies:**

  <!-- ```bash -->
  git clone https://github.com/wdNaimur/CrewUp-server.git  
  cd CrewUp-server  
  npm install
  <!-- ``` -->

- **Create a `.env` file** in the project root and add:

  <!-- ```env -->
  MONGODB_URI=your_mongodb_connection_string
  <!-- ``` -->

- **Run the development server:**

  <!-- ```bash -->
  npm run dev
  <!-- ``` -->

- **Access the server locally at:**  
  `http://localhost:3000`

---

## 🌐 Live Project Links

- 🔗 [CrewUp Live](https://crewup.web.app/)  
- 💻 [Client Repository](https://github.com/wdNaimur/crewup-client)

---

<p align="center"><sub><strong>Designed & Developed by Md. Naimur Rahman</strong></sub></p>
