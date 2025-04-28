const ShopifyProductsModel = require("../models/shopifyProductsModel");

// Controller to get all Shopify vendor products
const getAllShopifyProducts = async (req, res) => {
    try {
        const vendors = await ShopifyProductsModel.fetchVendors();

        const productsByVendor = await Promise.all(
            vendors.map((vendor) => ShopifyProductsModel.fetchProducts(vendor))
        );

        const allProducts = productsByVendor.flat();

        res.status(200).json({
            status: 200,
            success: true,
            message: "Shopify vendor products fetched successfully",
            data: allProducts,
        });
    } catch (error) {
        res.status(400).json({ status: 400, error: err.message });
    }
};

module.exports = { getAllShopifyProducts };
