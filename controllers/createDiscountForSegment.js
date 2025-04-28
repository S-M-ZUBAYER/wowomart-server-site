// import axios from "axios";
const axios = require("axios");
const dotenv = require("dotenv");
// import dotenv from "dotenv";


dotenv.config();

const SHOPIFY_STORE = "1f9df1-0f.myshopify.com";
const API_VERSION = "2024-10";
const API_TOKEN = process.env.API_TOKEN;

const GRAPHQL_URL = `https://${SHOPIFY_STORE}/admin/api/${API_VERSION}/graphql.json`;

export const createDiscountForSegment = async (req, res) => {
  const { title, percentage, segmentQuery, code, expireDate, tag } = req.body;

  if ((!title || !percentage || !segmentQuery, !code, !expireDate)) {
    return res
      .status(400)
      .json({ error: "Missing title, percentage, or segmentQuery." });
  }
  let Query = "";
  if (tag) {
    Query = `customer_tags CONTAINS '${tag}'`;
  } else {
    Query = segmentQuery;
  }

  try {
    const segmentMutation = `
      mutation {
        segmentCreate(
          name: "${title} Segment",
          query: "${Query}"
        ) {
          segment {
            id
            name
            query
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const segmentResponse = await axios.post(
      GRAPHQL_URL,
      { query: segmentMutation },
      {
        headers: {
          "X-Shopify-Access-Token": API_TOKEN,
          "Content-Type": "application/json",
        },
      }
    );

    const segmentData = segmentResponse.data.data.segmentCreate;

    if (segmentData.userErrors.length > 0) {
      return res.status(400).json({
        error: "Segment creation failed",
        details: segmentData.userErrors,
      });
    }

    const segmentId = segmentData.segment.id;

    const discountMutation = `
      mutation discountCodeBasicCreate($basicCodeDiscount: DiscountCodeBasicInput!) {
        discountCodeBasicCreate(basicCodeDiscount: $basicCodeDiscount) {
          codeDiscountNode {
            id
            codeDiscount {
              ... on DiscountCodeBasic {
                title
                codes(first: 10) {
                  nodes {
                    code
                  }
                }
              }
            }
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const discountPayload = {
      query: discountMutation,
      variables: {
        basicCodeDiscount: {
          title,
          code: code.replace(/\s+/g, "_").toUpperCase(),
          customerGets: {
            value: {
              percentage: percentage / 100,
            },
            items: {
              all: true,
            },
          },
          customerSelection: {
            customerSegments: {
              add: [segmentId],
            },
          },
          appliesOncePerCustomer: true,
          startsAt: new Date().toISOString(),
          endsAt: expireDate,
          usageLimit: 1,
        },
      },
    };

    const discountResponse = await axios.post(GRAPHQL_URL, discountPayload, {
      headers: {
        "X-Shopify-Access-Token": API_TOKEN,
        "Content-Type": "application/json",
      },
    });

    const discountData = discountResponse.data.data.discountCodeBasicCreate;

    if (discountData.userErrors.length > 0) {
      return res.status(400).json({
        error: "Discount creation failed",
        details: discountData.userErrors,
      });
    }

    return res.json({
      success: true,
      segment: segmentData.segment,
      discount: discountData.codeDiscountNode,
    });
  } catch (error) {
    console.error(
      "Error creating discount with segment:",
      error.response?.data || error.message
    );
    return res.status(500).json({
      error: "Internal server error",
      details: error.response?.data || error.message,
    });
  }
};
