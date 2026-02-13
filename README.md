# BeautyMate Backend

REST API backend for **BeautyMate**, a skincare e-commerce application with AI-powered skin type prediction and personalized product recommendations. Built with TypeScript, Express, Prisma, and PostgreSQL.

---

## Features

### AI Skin Type Prediction

- Upload a skin image and get a predicted skin type (Oily, Dry, Normal, Combination, Acne) with a confidence score
- Images are forwarded to an external deep learning model API for analysis
- Results are persisted in the user's `SkinProfile` for future use

### Personalized Product Recommendations

- Recommends products based on the user's predicted skin type
- Maps related skin types together (e.g., Oily + Acne) for broader, relevant suggestions

### Product & Category Management

- Full CRUD operations for products and categories
- Products include: name, price, brand, image URL, description, skin type, and stock quantity
- Case-insensitive product search by name
- Link and organize products under categories

### Favorites

- Toggle favorite status on any product per user
- View all favorited products for a user

### Shopping Cart

- Per-user cart: add, remove, update quantity, view, and clear items
- Auto-creates cart on first item addition
- Computes total price per item on retrieval
- Save/restore cart contents via a `SavedCartItem` table

### Order Management

- Create an order from the current cart (calculates totals, stores address, clears cart)
- Cancel pending orders
- Checkout: marks order as completed and generates a shipping record
- View all orders or a single order with items, address, and shipping details

### User Management

- Firebase ID-based registration with optional avatar image upload
- Multiple addresses per user
- Phone number management
- User profile retrieval (addresses, role, avatar, phone)

### Authentication & Authorization

- **Firebase IDs** for user identity, **JWT** for session tokens
- Token verification middleware (`verifyToken`)
- Role-based access control middleware (`allowedTo`) supporting roles: `ADMIN`, `USER`, `PRODUCT_MANAGER`, `DELIVERYPARTNER`

---

## API Endpoints

### Users — `/api/users`

| Method | Path           | Description                                   |
| ------ | -------------- | --------------------------------------------- |
| `GET`  | `/`            | List all users                                |
| `POST` | `/register`    | Register (multipart — optional avatar upload) |
| `POST` | `/login`       | Login by Firebase ID                          |
| `PUT`  | `/address`     | Add address to user                           |
| `PUT`  | `/phoneNumber` | Update phone number                           |
| `GET`  | `/:firebaseId` | Get user profile                              |

### Products — `/api/products`

| Method   | Path                       | Description                  |
| -------- | -------------------------- | ---------------------------- |
| `GET`    | `/`                        | Get all products             |
| `POST`   | `/`                        | Create a product             |
| `GET`    | `/:id`                     | Get product by ID            |
| `PATCH`  | `/:id`                     | Update product               |
| `DELETE` | `/:id`                     | Delete product               |
| `GET`    | `/search/:searchQuery`     | Search products by name      |
| `PUT`    | `/toggleFavorite`          | Toggle favorite for a user   |
| `GET`    | `/fav/user/:firebaseId`    | Get user's favorite products |
| `GET`    | `/recommended/:firebaseId` | Get recommended products     |

### Categories — `/api/categories`

| Method   | Path        | Description                    |
| -------- | ----------- | ------------------------------ |
| `GET`    | `/`         | Get all categories             |
| `POST`   | `/`         | Create a category              |
| `GET`    | `/:id`      | Get category with its products |
| `PATCH`  | `/:id`      | Update category                |
| `DELETE` | `/:id`      | Delete category                |
| `POST`   | `/products` | Add a product to a category    |

### Cart — `/api/cart`

| Method   | Path                                                | Description                 |
| -------- | --------------------------------------------------- | --------------------------- |
| `POST`   | `/add-item`                                         | Add item to cart            |
| `DELETE` | `/remove-item/:itemId`                              | Remove item from cart       |
| `PUT`    | `/update-item/:itemId`                              | Update item quantity        |
| `GET`    | `/:firebaseId`                                      | View cart contents          |
| `DELETE` | `/clear/:firebaseId`                                | Clear entire cart           |
| `POST`   | `/save/:firebaseId`                                 | Save cart items             |
| `PUT`    | `/users/:firebaseId/products/:productId/toggleCart` | Toggle cart flag on product |

### Orders — `/api/order`

| Method   | Path                 | Description                        |
| -------- | -------------------- | ---------------------------------- |
| `POST`   | `/create`            | Create order from cart             |
| `GET`    | `/users/:firebaseId` | Get all orders for a user          |
| `GET`    | `/:orderId`          | Get single order                   |
| `DELETE` | `/cancel`            | Cancel a pending order             |
| `POST`   | `/checkout`          | Complete order and create shipment |

### ML Prediction — `/api/model`

| Method | Path                   | Description                         |
| ------ | ---------------------- | ----------------------------------- |
| `POST` | `/predict/:firebaseId` | Upload skin image for AI prediction |

---

## Tech Stack

| Layer          | Technology                                        |
| -------------- | ------------------------------------------------- |
| Runtime        | Node.js                                           |
| Language       | TypeScript                                        |
| Framework      | Express.js                                        |
| ORM            | Prisma                                            |
| Database       | PostgreSQL                                        |
| Auth           | Firebase IDs + JWT                                |
| File Uploads   | Multer (disk for avatars, memory for predictions) |
| ML Integration | External prediction API via Axios                 |
| Validation     | express-validator                                 |
| Logging        | Morgan (dev mode)                                 |

---

## Data Model

Key entities: **User**, **Product**, **Category**, **Cart / CartItem**, **Order / OrderItem**, **SkinProfile**, **Address**, **Shipping**, **DeliveryPartner**, **ProductManager**, **Admin**, **UserFavorite**, **SavedCartItem**

---

## Getting Started

### Prerequisites

- Node.js (LTS recommended)
- PostgreSQL database

### Setup

```bash
git clone <repo-url>
cd GRADUATION-PROJECT-NODEJS
npm install
```

Create a `.env` file with:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/beautymate"
JWT_SECRET="your-secret"
JWT_EXPIRES_IN="7d"
PORT=3000
```

Apply database migrations:

```bash
npm run prisma:migrate
```

### Development

```bash
npm run dev
```

### Production

```bash
npm run build
npm start
```

---

## Project Structure

```
src/
├── app.ts                  # Express app setup & route mounting
├── server.ts               # Server entry point
├── controller/             # Route handlers
├── middleware/              # Auth, error handling, validation
├── routes/                 # Route definitions
├── types/                  # TypeScript type augmentations
└── utils/                  # Helpers (AppError, JWT, Prisma client, validators)
prisma/
├── schema.prisma           # Database schema
└── migrations/             # Migration history
uploads/                    # Uploaded files (avatars)
```

---

## License

This project is licensed under the [MIT License](LICENSE).

## Contact

Questions or suggestions? Reach out at [masym32@gmail.com](mailto:masym32@gmail.com).
