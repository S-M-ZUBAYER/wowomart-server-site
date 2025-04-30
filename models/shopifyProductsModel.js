const axios = require("axios");

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

        const products = response?.data?.data?.products;

        products?.edges.forEach(({ node }) => {
            if (node.vendor && node.vendor !== "Grozziie") {
                vendors.add(node.vendor);
            }
        });

        hasNextPage = products?.pageInfo?.hasNextPage || false;
        endCursor = products?.pageInfo?.endCursor || null;
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
                  price
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

    const products = response?.data?.data?.products;

    return products.edges.map(({ node }) => {
        const variantId = node.variants?.edges?.[0]?.node?.id?.split("/").pop() || "";
        const productPrice = node.variants?.edges?.[0]?.node?.price || "0.00";

        return {
            id: node.id,
            handle: node.handle,
            vendor: node.vendor,
            image: node.images?.edges?.[0]?.node?.src || null,
            url: `https://wowomart.com/products/${node.handle}?variant=${variantId}`,
            productPrice: parseFloat(productPrice).toFixed(2),
        };
    });
};

module.exports = {
    fetchVendors,
    fetchProducts,
};
