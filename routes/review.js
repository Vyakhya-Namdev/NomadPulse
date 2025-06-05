const express = require("express");
const router = express.Router({ mergeParams: true });  //mergeParams -> to merge the routes with parent 
const wrapAsync = require("../utils/wrapAsync.js");
const Review= require("../models/review.js");
const Listing = require("../models/listing.js");
const { validateReview, isLoggedIn, isReviewAuthor } = require("../authentication.js");
const { createReview, destroyReview } = require("../controllers/review.js");

//Review 
//-> Post Route
router.post("/:id/reviews", isLoggedIn, validateReview, wrapAsync(createReview));

//-> Delete review Route
router.delete("/:id/reviews/:reviewId", isLoggedIn, isReviewAuthor, wrapAsync(destroyReview));

module.exports = router;