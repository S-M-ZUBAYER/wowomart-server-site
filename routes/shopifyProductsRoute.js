const express = require("express");
const router = express.Router();
const { getAllShopifyProducts } = require("../controllers/shopifyProductsController");

// Route: GET /api/shopify/products
router.get("/shopify/products", getAllShopifyProducts);

module.exports = router;
