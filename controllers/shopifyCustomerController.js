const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const SHOPIFY_STORE = '1f9df1-0f.myshopify.com';
const API_VERSION_REST = '2025-01';
const API_VERSION_GRAPHQL = '2024-10';
const API_TOKEN = process.env.API_TOKEN;

// REST tag update
const updateTags = async (req, res) => {
    try {
        const { update, customerId, tags } = req.body;

        if (!customerId) return res.status(400).json({ error: 'customerId is required' });

        if (update === 0) {
            const response = await axios.put(
                `https://${SHOPIFY_STORE}/admin/api/${API_VERSION_REST}/customers/${customerId}.json`,
                { customer: { id: customerId, tags } },
                { headers: { 'X-Shopify-Access-Token': API_TOKEN, 'Content-Type': 'application/json' } }
            );
            return res.json({ success: true, method: 'REST', data: response.data });
        }

        const isRemove = update === 2;
        const mutationName = isRemove ? 'tagsRemove' : 'tagsAdd';
        const graphqlUrl = `https://${SHOPIFY_STORE}/admin/api/${API_VERSION_GRAPHQL}/graphql.json`;

        const graphqlQuery = `
      mutation ${mutationName}($id: ID!, $tags: [String!]!) {
        ${mutationName}(id: $id, tags: $tags) {
          node {
            id
            ... on Customer {
              tags
            }
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

        const graphqlResponse = await axios.post(
            graphqlUrl,
            {
                query: graphqlQuery,
                variables: {
                    id: `gid://shopify/Customer/${customerId}`,
                    tags,
                },
            },
            {
                headers: {
                    'X-Shopify-Access-Token': API_TOKEN,
                    'Content-Type': 'application/json',
                },
            }
        );

        res.json({
            success: true,
            method: isRemove ? 'GraphQL Remove' : 'GraphQL Add',
            data: graphqlResponse.data,
        });
    } catch (error) {
        console.error('Error updating tags:', error);
        res.status(500).json({ error: 'Failed to update customer tags', details: error.message });
    }
};

// Dummy Example 2: Get Customer Info
const getCustomerInfo = async (req, res) => {
    const { customerId } = req.params;

    try {
        const response = await axios.get(
            `https://${SHOPIFY_STORE}/admin/api/${API_VERSION_REST}/customers/${customerId}.json`,
            {
                headers: {
                    'X-Shopify-Access-Token': API_TOKEN,
                },
            }
        );
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching customer info:', error);
        res.status(500).json({ error: 'Failed to fetch customer info' });
    }
};

// Dummy Example 3: List Customers
const listCustomers = async (req, res) => {
    try {
        const response = await axios.get(
            `https://${SHOPIFY_STORE}/admin/api/${API_VERSION_REST}/customers.json`,
            {
                headers: {
                    'X-Shopify-Access-Token': API_TOKEN,
                },
            }
        );
        res.json(response.data.customers);
    } catch (error) {
        console.error('Error listing customers:', error);
        res.status(500).json({ error: 'Failed to list customers' });
    }
};

// Exporting all functions
module.exports = {
    updateTags,
    getCustomerInfo,
    listCustomers,
};
