# Backend — Spring Boot API

REST API for the Restaurant Management System.

| | |
|---|---|
| **Runtime** | Java 17 |
| **Framework** | Spring Boot 3.2 |
| **Database** | MongoDB |
| **Security** | Spring Security + JWT (HS256) |
| **Port** | `8000` |

## Prerequisites

- Java 17+
- Maven 3.9+
- MongoDB (local or remote)

## Run

```bash
cd backend
mvn spring-boot:run
```

Production JAR:

```bash
mvn clean package -DskipTests
java -jar target/restaurant-management-system-1.0.0.jar
```

## Configuration

Copy [`.env.example`](.env.example) or set environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `MONGODB_URL` | `mongodb://localhost:27017/` | MongoDB URI (`MONGO_URL` also works) |
| `DATABASE_NAME` | `tabserv` | Database name |
| `SECRET_KEY` | (see `application.properties`) | JWT secret — use 32+ chars in production |
| `ALGORITHM` | `HS256` | JWT algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `30` | Token lifetime |
| `BOOTSTRAP_ADMIN_ENABLED` | `true` | Create default admin if none exists |
| `BOOTSTRAP_ADMIN_USERNAME` | `admin` | Bootstrap username |
| `BOOTSTRAP_ADMIN_PASSWORD` | `admin123` | Bootstrap password |

Properties file: `src/main/resources/application.properties`

## Health check

```http
GET http://localhost:8000/
```

```json
{ "message": "Welcome Uniqtx!" }
```

## Login example

```http
POST http://localhost:8000/user/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

Response:

```json
{
  "access_token": "<jwt>",
  "token_type": "bearer"
}
```

Use header on protected routes: `Authorization: Bearer <jwt>`

JWT claims: `sub` (username), `user_type`, `privilege`, `exp`

## Layered architecture

```
com.restaurant.tabserv
├── controller/     HTTP layer (REST)
├── service/        Business logic
├── repository/     Spring Data MongoDB
├── model/          @Document entities
├── dto/            Request/response records
├── security/       JWT filter & token provider
├── config/         Security, CORS, bootstrap admin
├── exception/      ApiException + global handler
└── util/           SecurityUtils
```

Errors follow FastAPI-style JSON: `{ "detail": "message" }`

## MongoDB collections

| Collection | Java model | Notes |
|------------|------------|--------|
| `user` | `UserDocument` | bcrypt `hashed_password` |
| `orders` | `OrderDocument` | Nested `orders[]` line items |
| `menu` | `MenuItemDocument` | Optional `image_url` |
| `tabs` | `TabDocument` | Table / waiter / support state |

## API summary

### User — `/user`

- `POST /login` — public
- `POST /register` — admin
- `GET /me`, `GET /list`, `PUT /update/{username}`, `DELETE /delete/{username}`

### Menu — `/menu`

- `GET /items`, `GET /items/{id}`, `GET /categories` — public read
- `POST /items` — admin, `multipart/form-data` (name, price, category, optional image)
- `PUT /items/{id}`, `DELETE /items/{id}` — admin

### Order — `/order`

- `POST /create`
- `GET /status/{orderId}` — public
- `GET /customer/orders`, `GET /all`
- `PUT /update/{orderId}`, `DELETE /cancel/{orderId}`, `PUT /make_takeaway/{orderId}`

### Tabs — `/tabs`

- `POST /add_tab`, `GET /list_tabs`, `DELETE /delete_tab/{tabName}`
- `PUT /update_tab_name/{oldName}` — body: `{ "new_name": "..." }`
- `PUT /update_table/{tabName}?table=5`
- `PUT /call_waiter/{tabName}?waiter_text=...`, `PUT /clear_waiter/{tabName}`
- `PUT /call_support/{tabName}?support_text=...`, `PUT /clear_support/{tabName}`

### Kitchen — `/cook`

- `GET /list_pending_dishes?skip=0&limit=10`
- `PUT /update_order_status/{orderId}` — **Cook** role only

  Body example:

  ```json
  {
    "status": "cooking",
    "cook": "chef_name",
    "dish": "Paneer Butter Masala",
    "updated_at": "2026-05-24T12:00:00Z"
  }
  ```

  Valid statuses: `pending`, `cooking`, `ready`

## Static files

Menu images are stored under `uploads/menu_images/` and served at:

```
http://localhost:8000/uploads/menu_images/<filename>
```

## Tests

```bash
mvn test
```

## Related

Root setup and frontend: [../Readme.md](../Readme.md)
