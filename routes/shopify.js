const express = require("express");
const axios = require("axios");
const dotenv = require("dotenv");

dotenv.config();

const router = express.Router();

// Utility function for error handling
const handleError = (res, error, message) => {
    console.error(message, error);
    res.status(500).json({ error: message });
};

const shopifyAPI = axios.create({
    baseURL: `https://1f9df1-0f.myshopify.com/admin/api/2024-10/graphql.json`,
    headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": process.env.API_TOKEN,
    },
});

// Fetch all unique vendors (excluding Grozziie)
const fetchVendors = async () => {
    let vendors = new Set();
    let hasNextPage = true;
    let endCursor = null;

    while (hasNextPage) {
        const query = `
      query GetAllProducts($cursor: String) {
        products(first: 100, after: $cursor) {
          edges {
            node {
              vendor
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }`;

        const response = await shopifyAPI.post("", {
            query,
            variables: { cursor: endCursor },
        });

        const { products } = response.data.data;
        products.edges.forEach(({ node }) => {
            if (node.vendor && node.vendor !== "Grozziie") {
                vendors.add(node.vendor);
            }
        });

        hasNextPage = products.pageInfo.hasNextPage;
        endCursor = products.pageInfo.endCursor;
    }

    return Array.from(vendors);
};

// Fetch products for a specific vendor
const fetchProducts = async (vendor) => {
    const query = `
    query GetProductsByVendor($vendor: String!) {
      products(first: 50, query: $vendor) {
        edges {
          node {
            id
            handle
            vendor
            images(first: 1) {
              edges {
                node {
                  src
                  altText
                }
              }
            }
            variants(first: 1) {
              edges {
                node {
                  id
                }
              }
            }
          }
        }
      }
    }`;

    const response = await shopifyAPI.post("", {
        query,
        variables: { vendor },
    });

    return response.data.data.products.edges.map(({ node }) => {
        const variantId =
            node.variants?.edges?.[0]?.node?.id?.split("/").pop() || "";
        return {
            id: node.id,
            handle: node.handle,
            vendor: node.vendor,
            image: node.images?.edges?.[0]?.node || null,
            url: `https://wowomart.com/products/${node.handle}?variant=${variantId}`,
        };
    });
};

// GET route to fetch all Shopify vendor products
router.get("/shopify/products", async (req, res) => {
    try {
        const vendors = await fetchVendors();

        const productsByVendor = await Promise.all(
            vendors.map((vendor) => fetchProducts(vendor))
        );

        const allProducts = productsByVendor.flat();

        res.status(200).json({
            status: 200,
            success: true,
            message: "Shopify vendor products fetched successfully",
            data: allProducts,
        });
    } catch (error) {
        handleError(res, error, "Error fetching Shopify products");
    }
});

module.exports = router;
