const express = require("express");
const { getAllShopifyProducts } = require("../controllers/shopifyProductsController");

const router = express.Router();

router.get("/shopify/products", getAllShopifyProducts);

module.exports = router;
