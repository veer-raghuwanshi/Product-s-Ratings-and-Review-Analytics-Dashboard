const XLSX = require('xlsx');
const { QueryTypes, Op } = require('sequelize');
const { Product, sequelize } = require('../models');
const { productSchema } = require('../utils/validation');

const UPSERT_BATCH_SIZE = 500;

const parseNum = (val) => {
  if (val === null || val === undefined || val === '') return null;
  const num = parseFloat(String(val).replace(/[^0-9.-]/g, ''));
  return isNaN(num) ? null : num;
};

function normalizeRow(row) {
  const product_id = row.product_id || row['Product ID'] || row.productId;
  const product_name = row.product_name || row['Product Name'] || row.productName;

  return {
    product_id: product_id ? String(product_id).trim() : null,
    product_name: product_name ? String(product_name).trim() : null,
    category: row.category || null,
    discounted_price: parseNum(row.discounted_price),
    actual_price: parseNum(row.actual_price),
    discount_percentage: parseNum(row.discount_percentage),
    rating: parseNum(row.rating),
    rating_count: (() => {
      const r = parseNum(row.rating_count);
      return r !== null ? Math.round(r) : null;
    })(),
    about_product: row.about_product || row['About Product'] || null,
    user_name: row.user_name || row['User Name'] || null,
    review_title: row.review_title || row['Review Title'] || null,
    review_content: row.review_content || row['Review Content'] || null,
  };
}

async function upsertRows(rows) {
  let inserted = 0;
  let skipped = 0;
  const errors = [];
  const validRows = [];

  for (const row of rows) {
    const payload = normalizeRow(row);

    const { error } = productSchema.validate(payload, { abortEarly: false, convert: true });
    if (error) {
      skipped++;
      errors.push({ product_id: payload.product_id || null, validation: error.details.map((d) => d.message) });
      continue;
    }

    validRows.push(payload);
  }

  const updateColumns = [
    'product_name',
    'category',
    'discounted_price',
    'actual_price',
    'discount_percentage',
    'rating',
    'rating_count',
    'about_product',
    'user_name',
    'review_title',
    'review_content',
    'updated_at',
  ];

  for (let i = 0; i < validRows.length; i += UPSERT_BATCH_SIZE) {
    const batch = validRows.slice(i, i + UPSERT_BATCH_SIZE);

    try {
      await Product.bulkCreate(batch, { updateOnDuplicate: updateColumns });
      inserted += batch.length;
    } catch (e) {
      skipped += batch.length;
      errors.push({ batch_start: i, error: e.message });
    }
  }

  return { inserted, skipped, errors };
}

function rowsFromWorkbook(workbook) {
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  let rows = XLSX.utils.sheet_to_json(sheet, { defval: null });
  if (rows.length > 0 && !Object.keys(rows[0]).includes('product_id')) {
    rows = XLSX.utils.sheet_to_json(sheet, { defval: null, range: 1 });
  }
  return rows;
}

async function upsertFromBuffer(buffer) {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const rows = rowsFromWorkbook(workbook);
  if (!rows || rows.length === 0) {
    return { inserted: 0, skipped: 0, errors: [], message: 'NO_DATA_ROWS' };
  }
  return upsertRows(rows);
}

async function upsertFromFilePath(path) {
  const workbook = XLSX.readFile(path);
  const rows = rowsFromWorkbook(workbook);
  if (!rows || rows.length === 0) {
    return { inserted: 0, skipped: 0, errors: [], message: 'NO_DATA_ROWS' };
  }
  return upsertRows(rows);
}

async function getProducts({ page = 1, limit = 10, search, category, minRating, maxRating }) {
  const offset = (page - 1) * limit;
  const where = {};

  if (search) where.product_name = { [Op.like]: `%${search}%` };
  if (category) where.category = { [Op.like]: `%${category}%` };
  if (minRating || maxRating) {
    where.rating = {};
    if (minRating) where.rating[Op.gte] = parseFloat(minRating);
    if (maxRating) where.rating[Op.lte] = parseFloat(maxRating);
  }

  return Product.findAndCountAll({
    where,
    attributes: [
      'id', 'product_id', 'product_name', 'category',
      'discounted_price', 'actual_price', 'discount_percentage',
      'rating', 'rating_count', 'review_title',
    ],
    order: [['id', 'DESC']],
    limit,
    offset,
  });
}

async function getProductById(id) {
  return Product.findByPk(id);
}

async function getCategories() {
  const results = await sequelize.query(
    `SELECT DISTINCT TRIM(SUBSTRING_INDEX(category, '|', 1)) AS main_category
       FROM products
       WHERE category IS NOT NULL AND category <> ''
       ORDER BY main_category`,
    { type: QueryTypes.SELECT }
  );
  return results.map((r) => r.main_category).filter(Boolean);
}

async function analyticsSummary() {
  const [result] = await sequelize.query(
    `SELECT
      COUNT(*) AS total_products,
      ROUND(AVG(rating), 2) AS avg_rating,
      ROUND(AVG(discount_percentage), 2) AS avg_discount,
      SUM(rating_count) AS total_reviews,
      COUNT(DISTINCT TRIM(SUBSTRING_INDEX(category,'|',1))) AS total_categories
     FROM products`,
    { type: QueryTypes.SELECT }
  );
  return result;
}

async function productsPerCategory() {
  const results = await sequelize.query(
    `SELECT TRIM(SUBSTRING_INDEX(category, '|', 1)) AS main_category, COUNT(*) AS count
       FROM products
       WHERE category IS NOT NULL AND category <> ''
       GROUP BY main_category
       ORDER BY count DESC
       LIMIT 20`,
    { type: QueryTypes.SELECT }
  );
  return results;
}

async function topReviewed() {
  return Product.findAll({
    attributes: ['product_name', 'rating_count'],
    where: { rating_count: { [Op.not]: null } },
    order: [['rating_count', 'DESC']],
    limit: 10,
  });
}

async function discountDistribution() {
  const results = await sequelize.query(
    `SELECT
      CASE
        WHEN discount_percentage < 10  THEN '0-10%'
        WHEN discount_percentage < 20  THEN '10-20%'
        WHEN discount_percentage < 30  THEN '20-30%'
        WHEN discount_percentage < 40  THEN '30-40%'
        WHEN discount_percentage < 50  THEN '40-50%'
        WHEN discount_percentage < 60  THEN '50-60%'
        WHEN discount_percentage < 70  THEN '60-70%'
        WHEN discount_percentage < 80  THEN '70-80%'
        ELSE '80%+'
      END AS discount_range,
      COUNT(*) AS count,
      MIN(discount_percentage) AS min_val
     FROM products
     WHERE discount_percentage IS NOT NULL
     GROUP BY discount_range
     ORDER BY min_val`,
    { type: QueryTypes.SELECT }
  );
  return results;
}

async function categoryAvgRating() {
  const results = await sequelize.query(
    `SELECT
      TRIM(SUBSTRING_INDEX(category, '|', 1)) AS main_category,
      ROUND(AVG(rating), 2) AS avg_rating,
      COUNT(*) AS count
     FROM products
     WHERE category IS NOT NULL AND rating IS NOT NULL
     GROUP BY main_category
     HAVING COUNT(*) > 2
     ORDER BY avg_rating DESC
     LIMIT 15`,
    { type: QueryTypes.SELECT }
  );
  return results;
}

module.exports = {
  upsertFromBuffer,
  upsertFromFilePath,
  getProducts,
  getProductById,
  getCategories,
  analyticsSummary,
  productsPerCategory,
  topReviewed,
  discountDistribution,
  categoryAvgRating,
};
