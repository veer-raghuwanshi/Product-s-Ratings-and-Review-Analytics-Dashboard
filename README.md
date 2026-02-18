# Product-s-Ratings-and-Review-Analytics-Dashboard
This is Backend Service
# Product Ratings and Review Analytics Dashboard

A full-stack dashboard to upload, explore, and analyze product ratings/reviews data.

## Tech Stack

- Backend: Node.js, Express.js
- ORM: Sequelize v6
- Database: MySQL
- Frontend: React 18, Redux Toolkit
- UI: Material UI (MUI)
- Charts: Recharts
- File parsing: xlsx (SheetJS)

## Features

- Upload Excel/CSV files (`.xlsx`, `.xls`, `.csv`)
- Dashboard analytics cards and charts
- Product table with pagination, search, and filters
- Category and rating-based filtering
- Centralized API/state handling with Redux Toolkit

## Prerequisites

- Node.js v18+
- MySQL v8+ (or compatible)
- npm

## Project Structure

```text
project/
  backend/
    src/
      config/
      controllers/
      models/
      routes/
      services/
      migrations/
      index.js
  frontend/
    public/
    src/
      api/
      pages/
      store/
```

## Environment Setup

### Backend (`backend/.env`)

```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=product_analytics
DB_USER=root
DB_PASSWORD=
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

Place your Aiven CA certificate in `backend/certs/aiven-ca.pem`.

### Frontend (`frontend/.env`)

```env
REACT_APP_API_URL=http://localhost:5000/api
```

If `REACT_APP_API_URL` is not set, frontend can use the proxy in `frontend/package.json`.

## Run the Project

### 1) Install dependencies

```bash
cd backend
npm install

cd ../frontend
npm install
```

### 2) Start backend

```bash
cd backend
npm run dev
# or
npm start
```

Backend runs on: `http://localhost:5000`

Health check: `GET http://localhost:5000/health`

### 3) Start frontend

```bash
cd frontend
npm start
```

Frontend runs on: `http://localhost:3000`

## Import Dataset

Option 1: From UI
- Open `Upload Data` tab and upload a file.

Option 2: From backend script

```bash
cd backend
npm run import:excel
```

You can also pass a custom path:

```bash
node src/migrations/import_dataset.js "C:/path/to/file.xlsx"
```

## API Endpoints

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

### `GET /api/products` Query Params

- `page` (default `1`)
- `limit` (default `10`, max `100`)
- `search`
- `category`
- `minRating`
- `maxRating`

## Expected Dataset Columns

Required:
- `product_id`
- `product_name`

Common optional columns:
- `category`
- `discounted_price`
- `actual_price`
- `discount_percentage`
- `rating`
- `rating_count`
- `about_product`
- `user_name`
- `review_title`
- `review_content`

## Troubleshooting

- DB connection issues: verify `backend/.env` and MySQL service.
- Empty charts/table: import data first from Upload page.
- API errors from frontend: verify `REACT_APP_API_URL` and backend is running on port `5000`.
