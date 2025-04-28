// schemas/segmentDiscountSchema.js
const Joi = require("joi");

const segmentDiscountSchema = Joi.object({
    value: Joi.string().required(),
    label: Joi.string().required(),
    ApiUrl: Joi.string().uri().required()
});

module.exports = segmentDiscountSchema;
