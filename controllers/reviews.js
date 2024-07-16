const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const User = require("../models/user.js");

module.exports.createReview = async (req, res) => {
    const listing = await Listing.findById(req.params.id);

    req.body.review.comment = req.body.review.comment.trim();
    const newReview = new Review({
        rating: req.body.review.rating,
        comment: req.body.review.comment,
    });
    newReview.author = req.user._id;
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    req.flash("success"," Review successfully created by");

    let reviewuser = await User.findById(newReview.author._id);
    req.flash("message" ,`${reviewuser.username}.`)
    res.redirect(`/listings/${listing._id}`);
}

module.exports.destroyReview  =async(req,res)=>{
    let{id,reviewId} = req.params;
     let reviewuser = await User.findById(req.user._id);
    await Listing.findByIdAndUpdate(id , {$pull : {reviews : reviewId}});
    await Review.findByIdAndDelete(reviewId);
     req.flash("message",`${reviewuser.username}'s`)
    req.flash("warning","review has been deleted.");
    res.redirect(`/listings/${id}`)
};