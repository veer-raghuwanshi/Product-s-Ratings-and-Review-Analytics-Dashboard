require('dotenv').config();
const path = require('path');
const fs = require('fs');
const { syncDB } = require('../models');
const productService = require('../services/productService');

async function main() {
  try {
    await syncDB();

    const arg = process.argv[2];
    // default to dataset file path if none provided
    const defaultPath = 'C:/Users/Lenovo/Downloads/product-analytics-dashboard (1)/project/backend/Assignment_-_2_Dataset__2_.xlsx';
    const filePath = arg || defaultPath;

    if (!fs.existsSync(filePath)) {
      console.error('File not found:', filePath);
      process.exit(2);
    }

    console.log('Importing from', filePath);
    const result = await productService.upsertFromFilePath(filePath);
    console.log('Import result:', result);
    process.exit(0);
  } catch (err) {
    console.error('Import failed:', err);
    process.exit(1);
  }
}

if (require.main === module) main();
