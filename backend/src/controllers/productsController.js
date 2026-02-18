const productService = require('../services/productService');
const errors = require('../constants/errors');

exports.upload = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: errors.FILE_REQUIRED });

    const ext = req.file.originalname.split('.').pop().toLowerCase();
    if (!['xlsx', 'xls', 'csv'].includes(ext)) {
      return res.status(400).json({ error: errors.INVALID_FILE_TYPE });
    }

    const result = await productService.upsertFromBuffer(req.file.buffer);
    return res.json({ success: true, ...result });
  } catch (err) {
    console.error('Upload controller error:', err);
    return res.status(500).json({ error: errors.INTERNAL_ERROR, details: err.message });
  }
};

exports.importFromPath = async (req, res) => {
  try {
    const { path } = req.body;
    if (!path) return res.status(400).json({ error: 'path is required' });
    const result = await productService.upsertFromFilePath(path);
    return res.json({ success: true, ...result });
  } catch (err) {
    console.error('Import controller error:', err);
    return res.status(500).json({ error: errors.INTERNAL_ERROR, details: err.message });
  }
};

exports.list = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const { count, rows } = await productService.getProducts({
      page,
      limit,
      search: req.query.search,
      category: req.query.category,
      minRating: req.query.minRating,
      maxRating: req.query.maxRating,
    });
    return res.json({ data: rows, pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: errors.INTERNAL_ERROR });
  }
};

exports.getById = async (req, res) => {
  try {
    const product = await productService.getProductById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    return res.json(product);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: errors.INTERNAL_ERROR });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const results = await productService.getCategories();
    return res.json(results);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: errors.INTERNAL_ERROR });
  }
};

exports.analyticsSummary = async (req, res) => {
  try {
    const result = await productService.analyticsSummary();
    return res.json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: errors.INTERNAL_ERROR });
  }
};

exports.productsPerCategory = async (req, res) => {
  try {
    const results = await productService.productsPerCategory();
    return res.json(results);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: errors.INTERNAL_ERROR });
  }
};

exports.topReviewed = async (req, res) => {
  try {
    const results = await productService.topReviewed();
    return res.json(results);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: errors.INTERNAL_ERROR });
  }
};

exports.discountDistribution = async (req, res) => {
  try {
    const results = await productService.discountDistribution();
    return res.json(results);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: errors.INTERNAL_ERROR });
  }
};

exports.categoryAvgRating = async (req, res) => {
  try {
    const results = await productService.categoryAvgRating();
    return res.json(results);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: errors.INTERNAL_ERROR });
  }
};
