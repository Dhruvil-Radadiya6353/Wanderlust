const Joi = require('joi');
const review = require('./models/review');

const listingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        image: Joi.object({
            url: Joi.string(),
            filename: Joi.string()
        }),
        price: Joi.number().required().min(0).default(0), // Default price to 0
        location: Joi.string().required(), 
        country: Joi.string().required()
    }).required()
});


const reviewSchema = Joi.object({
    review: Joi.object({
                 username:Joi.string(),
                 rating : Joi.number().required().min(1).max(5),
                 comment : Joi.string().required().trim(),
                 createdAt : Joi.date(),

    }).required()
});

module.exports = { listingSchema, reviewSchema };
