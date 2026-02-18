const express = require('express');
const router = express.Router();
const multer = require('multer');
const controller = require('../controllers/productsController');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

router.post('/upload', upload.single('file'), controller.upload);
router.post('/import', controller.importFromPath);
router.get('/', controller.list);
router.get('/categories', controller.getCategories);
router.get('/analytics/summary', controller.analyticsSummary);
router.get('/analytics/products-per-category', controller.productsPerCategory);
router.get('/analytics/top-reviewed', controller.topReviewed);
router.get('/analytics/discount-distribution', controller.discountDistribution);
router.get('/analytics/category-avg-rating', controller.categoryAvgRating);
router.get('/:id', controller.getById);

module.exports = router;
