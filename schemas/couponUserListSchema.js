// validation/couponUserListValidation.js
const Joi = require('joi');

const couponUserListSchema = Joi.object({
    title: Joi.string().required(),
    percentage: Joi.number().integer().required(),
    segmentQuery: Joi.string().allow(null, ''),
    minimumAmount: Joi.number().allow(null),
    minimumItem: Joi.number().integer().allow(null),
    code: Joi.string().required(),
    expireDate: Joi.date().allow(null),
    tag: Joi.string().allow(null, ''),
    segmentId: Joi.string().allow(null, ''),
    discountId: Joi.string().allow(null, ''),
    email: Joi.string().email().allow(null, ''),
    customerId: Joi.string().allow(null, '')
});

module.exports = { couponUserListSchema };

