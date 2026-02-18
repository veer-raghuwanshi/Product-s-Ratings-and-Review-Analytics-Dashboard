const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define(
  'Product',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    product_id: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: { notEmpty: { msg: 'product_id cannot be empty' } },
    },
    product_name: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: { notEmpty: { msg: 'product_name cannot be empty' } },
    },
    category: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    discounted_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      validate: { min: 0 },
    },
    actual_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      validate: { min: 0 },
    },
    discount_percentage: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      validate: { min: 0, max: 100 },
    },
    rating: {
      type: DataTypes.DECIMAL(3, 1),
      allowNull: true,
      validate: { min: 0, max: 5 },
    },
    rating_count: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: { min: 0 },
    },
    about_product: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    user_name: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    review_title: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    review_content: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: 'products',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

module.exports = Product;
