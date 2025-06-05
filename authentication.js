const Listing = require("./models/listing");
const Review = require("./models/review");
const ExpressError = require("./utils/ExpressError");
const { listingSchema, reviewSchema } = require("./schema.js");

module.exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()){
        //to redirect the user to the same page at which it was trying to do something. But, can't do sue to loggin
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "You must be logged in to listings!");
        return res.redirect("/login");
    }
    next();
}

//to store current url(before login/signup) in locals
module.exports.saveRedirectUrl = (req, res, next) =>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
}

//to check if owner of listing is correct
module.exports.isOwner = async (req, res, next) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if(!listing.owner.equals(res.locals.curUser._id)){
        req.flash("error", "You are not owner of this listing!");
        return res.redirect(`/listings/${id}`);
    }
    next();
}

//Validations for Schema
module.exports.validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);  //for checking server side error
    if(error){
        let { errorMsg } = error.details.map((el) => el.message).join(", ");
        throw new ExpressError(400, errorMsg);
    }else{
        next();
    } 
}

module.exports.validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);  //for checking server side error
    if(error){
        let { errorMsg } = error.details.map((el) => el.message).join(", ");
        throw new ExpressError(400, errorMsg);
    }else{
        next();
    } 
}

//only author of the review can delete its own author
module.exports.isReviewAuthor = async (req, res, next) => {
    let { id, reviewId } = req.params;
    let review = await Review.findById(reviewId);
    if(!review.author.equals(res.locals.curUser._id)){
        req.flash("error", "You are not the author of this review!");
        return res.redirect(`/listings/${id}`);
    }
    next();
}
