# Restaurant Management System

Full-stack restaurant management for orders, menu, tables, and kitchen workflow.

**Tech stack:** Java 17 · Spring Boot 3 · MongoDB · React Native (Expo) · JWT

| Layer    | Technology                                      |
|----------|-------------------------------------------------|
| Backend  | Spring Boot, Spring Security, Spring Data MongoDB |
| Database | MongoDB (`tabserv`)                             |
| Frontend | React Native / Expo, Axios                      |
| Auth     | JWT (Bearer token), role-based access           |

## Screenshots

### System Preview

<p align="center">
  <img src="https://raw.githubusercontent.com/dinesh1115/Restaurant-Management-System/main/SCREENSHORT_page-0001.jpg" width="300"/>
  <img src="https://raw.githubusercontent.com/dinesh1115/Restaurant-Management-System/main/SCREENSHORT_page-0002.jpg" width="300"/>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/dinesh1115/Restaurant-Management-System/main/SCREENSHORT_page-0003.jpg" width="300"/>
  <img src="https://raw.githubusercontent.com/dinesh1115/Restaurant-Management-System/main/SCREENSHORT_page-0004.jpg" width="300"/>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/dinesh1115/Restaurant-Management-System/main/SCREENSHORT_page-0005.jpg" width="300"/>
  <img src="https://raw.githubusercontent.com/dinesh1115/Restaurant-Management-System/main/SCREENSHORT_page-0006.jpg" width="300"/>
</p>

---

## Features

- Menu management with categories and image upload
- Order management (dine-in / takeaway)
- Table / tab management (waiter & support requests)
- Kitchen display for cooks (pending dishes, status updates)
- User roles: Admin, Cook, Waiter, Customer
- JWT authentication and role-based access control
- Layered Spring Boot backend architecture

## Project structure

```
Restaurant-Management-System/
├── backend/                 # Spring Boot API (port 8000)
│   └── src/main/java/.../   # controller → service → repository
├── frountend/               # React Native / Expo app
│   └── src/services/api.js  # API client (set HOST here)
└── Readme.md
```

## Prerequisites

- **Java 17+** and **Maven 3.9+**
- **Node.js 16+** and **npm**
- **MongoDB** running locally (or remote URI)
- **Git** (optional, for clone)

---

## Quick start

### 1. Backend (Spring Boot)

```bash
cd backend
mvn spring-boot:run
```

API: **http://localhost:8000**

Health check:

```http
GET http://localhost:8000/
```

Expected: `{"message":"Welcome Uniqtx!"}`

**Default admin** (created on first run if no users exist):

| Field    | Value      |
|----------|------------|
| Username | `admin`    |
| Password | `admin123` |

Override with `BOOTSTRAP_ADMIN_*` env vars (see `backend/.env.example`).

### 2. Frontend (React Native / Expo)

```bash
cd frountend
npm install
```

Set the backend URL in `frountend/src/services/api.js`:

```javascript
const HOST = "http://localhost:8000";  // or your LAN IP, e.g. http://10.8.0.2:8000
```

Start Expo:

```bash
npx expo start
```

- **Android:** press `a` or use Expo Go / emulator  
- **iOS:** press `i` (macOS)  
- **Web:** press `w`

---

## Configuration

### Backend

Environment variables (or `backend/src/main/resources/application.properties`):

```env
MONGODB_URL=mongodb://localhost:27017/
DATABASE_NAME=tabserv
SECRET_KEY=your_secret_key_at_least_32_characters_long
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

Legacy alias: `MONGO_URL` is also supported.

### Frontend

| File | Setting |
|------|---------|
| `frountend/src/services/api.js` | `HOST` — base URL of the API |

### MongoDB collections

| Collection | Purpose |
|------------|---------|
| `user`     | Accounts, bcrypt passwords, roles |
| `menu`     | Menu items and categories |
| `orders`   | Orders and line items |
| `tabs`     | Tables / tabs, waiter & support flags |

### CORS

Allowed origins are configured in `backend/.../config/WebConfig.java` (localhost Expo ports and example LAN `10.8.0.2`).

### Menu images

- Directory: `backend/uploads/menu_images/`
- Public URL: `/uploads/menu_images/{filename}`
- Formats: JPEG, PNG, GIF

---

## API reference

Base URL: `http://localhost:8000`

### User (`/user`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/user/login` | No | Login → `{ access_token, token_type }` |
| POST | `/user/register` | Admin | Create user |
| GET | `/user/me` | Yes | Current user |
| GET | `/user/list` | Admin | List users |
| PUT | `/user/update/{username}` | Yes | Update user |
| DELETE | `/user/delete/{username}` | Admin | Delete user |

### Menu (`/menu`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/menu/items` | No | List items |
| GET | `/menu/items/{id}` | No | Get item |
| GET | `/menu/categories` | No | Items grouped by category |
| POST | `/menu/items` | Admin | Create item (multipart form) |
| PUT | `/menu/items/{id}` | Admin | Update item |
| DELETE | `/menu/items/{id}` | Admin | Delete item |

### Order (`/order`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/order/create` | Yes | Create order |
| GET | `/order/status/{orderId}` | No | Order status |
| GET | `/order/customer/orders` | Yes | Customer order list |
| GET | `/order/all` | Yes | Orders by current user |
| PUT | `/order/update/{orderId}` | Yes | Update order |
| DELETE | `/order/cancel/{orderId}` | Yes | Cancel order |
| PUT | `/order/make_takeaway/{orderId}` | Yes | Convert to takeaway |

### Tabs (`/tabs`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/tabs/add_tab` | Yes | Add tab |
| GET | `/tabs/list_tabs` | Yes | List tabs |
| PUT | `/tabs/update_tab_name/{oldName}` | Yes | Rename tab |
| PUT | `/tabs/update_table/{tabName}` | Yes | Update table number |
| DELETE | `/tabs/delete_tab/{tabName}` | Yes | Delete tab |
| PUT | `/tabs/call_waiter/{tabName}` | Yes | Request waiter |
| PUT | `/tabs/clear_waiter/{tabName}` | Yes | Clear waiter request |
| PUT | `/tabs/call_support/{tabName}` | Yes | Request support |
| PUT | `/tabs/clear_support/{tabName}` | Yes | Clear support request |

### Kitchen (`/cook`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/cook/list_pending_dishes` | Yes | Pending / cooking dishes |
| PUT | `/cook/update_order_status/{orderId}` | Cook | Update dish status |

Cook role value in database must be **`Cook`** (case-sensitive) for status updates.

Full backend details: [backend/README.md](backend/README.md)

---

## User roles

| Role | Capabilities |
|------|----------------|
| **Admin** | Users, menu, tabs, full API access |
| **Cook** | Kitchen list, update dish status (`pending` → `cooking` → `ready`) |
| **Waiter** | Tables, orders, customer requests |
| **Customer** | Menu, place orders, track orders |

Create additional users via **Admin → Register** in the app, or `POST /user/register` with an admin token.

---

## Initial setup checklist

1. Start MongoDB and the Spring Boot backend.
2. Log in as `admin` / `admin123` and change the password.
3. Register users (Cook, Waiter, Customer) with the correct `privilege` values.
4. Add menu items via API or admin flows (`POST /menu/items`).
5. Create tabs/tables (`POST /tabs/add_tab`).
6. Point the mobile app `HOST` at your machine’s IP when testing on a physical device.

---

## Troubleshooting

| Issue | What to check |
|-------|----------------|
| MongoDB connection | Service running; `MONGODB_URL` / `DATABASE_NAME` |
| 401 on API calls | Valid JWT; `Authorization: Bearer <token>` header |
| App cannot reach API | `HOST` uses LAN IP (not `localhost`) on a real device |
| Cook cannot update status | User `privilege` is exactly `Cook` |
| npm install fails | `npm cache clean --force`, delete `node_modules`, reinstall |
| Expo issues | `npx expo start -c` to clear cache |
| Maven build fails | Java 17+, `mvn -version`, `cd backend` then `mvn clean package` |

---

## Security notes

1. Change `SECRET_KEY` and default admin password before production.
2. Enable MongoDB authentication in production.
3. Restrict CORS to your real frontend origins.
4. Use HTTPS behind a reverse proxy in production.

---

## Documentation links

- [Spring Boot](https://spring.io/projects/spring-boot)
- [Expo](https://docs.expo.dev/)
- [React Native](https://reactnative.dev/docs/getting-started)
- [MongoDB](https://www.mongodb.com/docs/)

---

## Happy coding
