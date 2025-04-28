// schemas/discountPercentSchema.js
const Joi = require("joi");

const discountPercentSchema = Joi.object({
    value: Joi.number().required(),
    label: Joi.string().required()
});

module.exports = discountPercentSchema;
