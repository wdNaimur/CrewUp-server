# 🚀 Crew Up Backend

This is the backend server for the Crew Up platform — handling group data and API requests.

---

## 🛠️ Tech Stack & Tools

- **Node.js & Express** – Backend server framework
- **MongoDB** – NoSQL database
- **MongoDB Node.js Driver** – To interact with MongoDB
- **dotenv** – Manage environment variables
- **CORS** – Enable cross-origin requests

---

## 🚩 API Endpoints

| Method | Endpoint           | Description                      |
| ------ | ------------------ | -------------------------------- |
| GET    | `/`                | Test route - server is running   |
| GET    | `/groups`          | Get all groups                   |
| GET    | `/groups/featured` | Get up to 6 active future groups |
| GET    | `/groups/:id`      | Get a single group by ID         |
| POST   | `/groups`          | Create a new group               |
| PATCH  | `/groups/:id`      | Update an existing group by ID   |
| DELETE | `/groups/:id`      | Delete a group by ID             |

---

## 📦 Dependencies

- express
- mongodb
- cors
- dotenv

---

## Author

Made with ❤️ by Naimur Rahman
