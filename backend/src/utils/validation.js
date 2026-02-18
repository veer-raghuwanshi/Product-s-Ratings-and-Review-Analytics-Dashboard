const Joi = require('joi');

const productSchema = Joi.object({
  product_id: Joi.string().required(),
  product_name: Joi.string().required(),
  category: Joi.string().allow(null, ''),
  discounted_price: Joi.number().min(0).precision(2).allow(null),
  actual_price: Joi.number().min(0).precision(2).allow(null),
  discount_percentage: Joi.number().min(0).max(100).precision(2).allow(null),
  rating: Joi.number().min(0).max(5).precision(1).allow(null),
  rating_count: Joi.number().integer().min(0).allow(null),
  about_product: Joi.string().allow(null, ''),
  user_name: Joi.string().allow(null, ''),
  review_title: Joi.string().allow(null, ''),
  review_content: Joi.string().allow(null, ''),
});

module.exports = { productSchema };
