// // services/shopifyDiscountService.js

// const axios = require("axios");
// const dotenv = require("dotenv");
// const newPool = require("../config/db"); // Make sure this is your MySQL pool config

// dotenv.config();

// const SHOPIFY_STORE = "1f9df1-0f.myshopify.com";
// const API_VERSION_GRAPHQL = "2024-10";
// const API_TOKEN = process.env.API_TOKEN;

// const deleteShopifyDiscount = async (discountId) => {
//   try {
//     if (!API_TOKEN || !SHOPIFY_STORE || !API_VERSION_GRAPHQL) {
//       throw new Error("Shopify config or API token is missing.");
//     }

//     const isValidGid = (id) =>
//       typeof id === "string" && id.startsWith("gid://shopify/");
//     if (!isValidGid(discountId)) {
//       throw new Error("Invalid discountId format. Must be a valid Shopify GID.");
//     }

//     const graphqlUrl = `https://${SHOPIFY_STORE}/admin/api/${API_VERSION_GRAPHQL}/graphql.json`;

//     const detectQuery = `
//       query getDiscountNode($id: ID!) {
//         node(id: $id) {
//           id
//           __typename
//         }
//       }
//     `;

//     const detectResponse = await axios.post(
//       graphqlUrl,
//       {
//         query: detectQuery,
//         variables: { id: discountId },
//       },
//       {
//         headers: {
//           "X-Shopify-Access-Token": API_TOKEN,
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     if (detectResponse.data.errors) {
//       throw new Error("Failed to detect discount type.");
//     }

//     const node = detectResponse.data?.data?.node;
//     if (!node) {
//       throw new Error(`Discount with ID ${discountId} not found.`);
//     }

//     const discountType = node.__typename;
//     let deleteMutation = "";
//     let deleteMutationName = "";

//     if (discountType === "DiscountAutomaticApp") {
//       deleteMutationName = "discountAutomaticAppDelete";
//       deleteMutation = `
//         mutation discountAutomaticAppDelete($id: ID!) {
//           discountAutomaticAppDelete(id: $id) {
//             deletedDiscountId
//             userErrors {
//               field
//               message
//             }
//           }
//         }
//       `;
//     } else if (discountType === "DiscountCodeApp") {
//       deleteMutationName = "discountCodeAppDelete";
//       deleteMutation = `
//         mutation discountCodeAppDelete($id: ID!) {
//           discountCodeAppDelete(id: $id) {
//             deletedDiscountId
//             userErrors {
//               field
//               message
//             }
//           }
//         }
//       `;
//     } else if (discountType === "DiscountCodeNode") {
//       deleteMutationName = "discountCodeDelete";
//       deleteMutation = `
//         mutation discountCodeDelete($id: ID!) {
//           discountCodeDelete(id: $id) {
//             userErrors {
//               field
//               message
//             }
//           }
//         }
//       `;
//     } else {
//       throw new Error(`Unsupported discount type: ${discountType || "Unknown"}`);
//     }

//     const deleteResponse = await axios.post(
//       graphqlUrl,
//       {
//         query: deleteMutation,
//         variables: { id: discountId },
//       },
//       {
//         headers: {
//           "X-Shopify-Access-Token": API_TOKEN,
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     const mutationResult = deleteResponse.data.data[deleteMutationName];

//     if (mutationResult.userErrors?.length > 0) {
//       throw new Error(
//         `Failed due to user errors: ${JSON.stringify(mutationResult.userErrors)}`
//       );
//     }

//     // Delete from MySQL database
//     const [dbResult] = await newPool.query(
//       "DELETE FROM wowomart_segment_discount_create WHERE discountId = ?",
//       [discountId]
//     );

//     return {
//       success: true,
//       message: "Discount deletion completed successfully.",
//       data: {
//         discount: {
//           success: true,
//           message: `Discount with ID ${discountId} deleted from Shopify and database.`,
//           discountId,
//         },
//         dbResult,
//       },
//     };
//   } catch (error) {
//     return {
//       success: false,
//       error: "Failed to delete discount.",
//       details: error.response?.data || error.message,
//     };
//   }
// };

// module.exports = { deleteShopifyDiscount };


const axios = require("axios"); // Adjust path if needed
const API_TOKEN = process.env.API_TOKEN;
const SHOPIFY_STORE = "1f9df1-0f.myshopify.com";
const API_VERSION_GRAPHQL = "2024-10";
const newPool = require("../config/db");

const deleteShopifyDiscount = async (discountId) => {
  try {
    if (!API_TOKEN || !discountId) {
      return { success: false, error: "Missing API_TOKEN or discountId" };
    }

    const graphqlUrl = `https://${SHOPIFY_STORE}/admin/api/${API_VERSION_GRAPHQL}/graphql.json`;

    // Step 1: Detect Discount Type
    const detectQuery = `
      query getDiscountNode($id: ID!) {
        node(id: $id) {
          id
          __typename
        }
      }
    `;

    const detectResponse = await axios.post(
      graphqlUrl,
      {
        query: detectQuery,
        variables: { id: discountId },
      },
      {
        headers: {
          "X-Shopify-Access-Token": API_TOKEN,
          "Content-Type": "application/json",
        },
      }
    );

    const node = detectResponse.data?.data?.node;
    const discountType = node?.__typename;

    if (!discountType) {
      return { success: false, error: "Discount not found or invalid ID" };
    }

    // Step 2: Prepare Delete Mutation
    let mutationName = "";
    let mutationQuery = "";

    if (discountType === "DiscountAutomaticApp") {
      mutationName = "discountAutomaticAppDelete";
      mutationQuery = `
        mutation($id: ID!) {
          discountAutomaticAppDelete(id: $id) {
            deletedDiscountId
            userErrors { field message }
          }
        }
      `;
    } else if (discountType === "DiscountCodeApp") {
      mutationName = "discountCodeAppDelete";
      mutationQuery = `
        mutation($id: ID!) {
          discountCodeAppDelete(id: $id) {
            deletedDiscountId
            userErrors { field message }
          }
        }
      `;
    } else if (discountType === "DiscountCodeNode") {
      mutationName = "discountCodeDelete";
      mutationQuery = `
        mutation($id: ID!) {
          discountCodeDelete(id: $id) {
            userErrors { field message }
          }
        }
      `;
    } else {
      return { success: false, error: `Unsupported discount type: ${discountType}` };
    }

    // Step 3: Execute Delete Mutation
    const deleteResponse = await axios.post(
      graphqlUrl,
      {
        query: mutationQuery,
        variables: { id: discountId },
      },
      {
        headers: {
          "X-Shopify-Access-Token": API_TOKEN,
          "Content-Type": "application/json",
        },
      }
    );

    const mutationResult = deleteResponse.data?.data?.[mutationName];
    const userErrors = mutationResult?.userErrors;

    if (userErrors?.length > 0) {
      return { success: false, error: "Shopify user error", details: userErrors };
    }

    // Step 4: Delete from MySQL Table
    await newPool.query(
      "DELETE FROM wowomart_segment_discount_create WHERE discountId = ?",
      [discountId]
    );

    return {
      success: true,
      message: `Discount ${discountId} deleted from Shopify and database.`,
    };
  } catch (error) {
    return {
      success: false,
      error: "Unexpected error occurred",
      details: error.response?.data || error.message,
    };
  }
};

module.exports = {
  deleteShopifyDiscount,
};
