const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isOwner, validateListing } = require("../authentication.js");
const { index, renderNewForm, showListings, createListing, renderEditForm, updateListing, destroyListing } = require("../controllers/listing.js");
//multer => use to save image file at a particular destination
const multer  = require('multer')
//using clouding to store image files
const { storage } = require("../cloudConfig.js");
const upload = multer({storage});

router
    .route("/")
    .get(wrapAsync(index)) //Index Route
    .post(isLoggedIn, upload.single('listing[image]'), validateListing, wrapAsync(createListing));  //create Route

//New Route
router.get("/new", isLoggedIn, renderNewForm);

router
    .route("/:id")
    .get(wrapAsync(showListings))  //Show Route
    .put(isLoggedIn, isOwner, upload.single('listing[image]'), validateListing, wrapAsync(updateListing))  //Update Route
    .delete(isLoggedIn, isOwner, wrapAsync(destroyListing));  //Delete Route

//Edit Route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(renderEditForm));


module.exports = router;