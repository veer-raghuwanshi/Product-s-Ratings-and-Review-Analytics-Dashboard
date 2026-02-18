# Product Ratings and Review Analytics Dashboard

A full-stack dashboard to upload, explore, and analyze product ratings/reviews data.

## Tech Stack

- Backend: Node.js, Express.js
- ORM: Sequelize v6
- Database: MySQL (local or Aiven)
- Frontend: React 18, Redux Toolkit
- UI: Material UI (MUI)
- Charts: Recharts
- File parsing: xlsx (SheetJS)

## Environment Setup

### Backend (`backend/.env`)

```env
PORT=5000
DB_HOST=your-db-host
DB_PORT=3306
DB_NAME=product_analytics
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_SSL=false
```

### Backend Aiven MySQL Example (`backend/.env`)

```env
PORT=5000
DATABASE_URL=mysql://avnadmin:<password>@<host>:22531/defaultdb?ssl-mode=REQUIRED
DB_SSL=true
DB_SSL_REJECT_UNAUTHORIZED=true
DB_SSL_CA_PATH=certs/aiven-ca.pem
```

### Frontend (`frontend/.env`)

```env
REACT_APP_API_URL=http://localhost:5000/api
```

## Run

```bash
cd backend
npm install
npm run dev
```

```bash
cd frontend
npm install
npm start
```

- Backend: `http://localhost:5000`
- Frontend: `http://localhost:3000`

## API

- `GET /health`
- `POST /api/products/upload`
- `POST /api/products/import`
- `GET /api/products`
- `GET /api/products/categories`
- `GET /api/products/:id`
- `GET /api/products/analytics/summary`
- `GET /api/products/analytics/products-per-category`
- `GET /api/products/analytics/top-reviewed`
- `GET /api/products/analytics/discount-distribution`
- `GET /api/products/analytics/category-avg-rating`
