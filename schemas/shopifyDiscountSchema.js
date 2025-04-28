
import Joi from "joi";

const shopifyDiscountSchema = Joi.object({
    title: Joi.string().required(),
    percentage: Joi.number().min(1).max(100).required(),
    minimumAmount: Joi.number().optional(),
    minimumItem: Joi.number().optional(),
    code: Joi.string().required(),
    expireDate: Joi.date().iso().required()
});


module.exports = shopifyDiscountSchema;