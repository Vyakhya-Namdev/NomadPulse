const Listing = require("../models/listing.js");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const baseClient = mbxGeocoding({ accessToken: mapToken });

// module.exports.index = async (req, res) => {
//     const searchQuery = req.query.search;
//     let allListings;
//     if (searchQuery) {
//         allListings = await Listing.find({
//             title: { $regex: searchQuery, $options: "i" } // Case-insensitive search on title
//         });
//     } else {
//         allListings = await Listing.find({});
//     }
//     res.render("./listings/index.ejs", { allListings });
// };

module.exports.index = async(req,res)=>{
    const { category, search } = req.query;
    let query = {};
    
    if (category) {
        query.category = category;
    }
    
    if (search) {
        query.$or = [
            { title: { $regex: search, $options: 'i' } },
            { location: { $regex: search, $options: 'i' } },
            { country: { $regex: search, $options: 'i' } }
        ];
    }
    
    const allListings = await Listing.find(query);
    res.render("listings/index", { 
  allListings,
  currentCategory: req.query.category,
  searchQuery: req.query.search 
});
};

module.exports.renderNewForm = (req, res) => {
    res.render("./listings/new.ejs"); 
};


module.exports.showListings = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id).populate({
        path: "reviews",
        populate: {
            path: "author",
        },
    }).populate("owner");
    if (!listing) {
        req.flash("error", "Listing you requested for doesn't exists!");
        return res.redirect("/listings");
    }
    console.log(listing);
    res.render("./listings/show.ejs", { listing });
};


module.exports.createListing = async (req, res, next) => {
    let response = await baseClient
        .forwardGeocode({
            query: req.body.listing.location,
            limit: 1,
        })
        .send();
    
    //let {title, description, image, price, country, location} = req.body;
    //making "listing" as an object in "new.ejs"
    let url = req.file.path;
    let filename = req.file.filename;
    
    let newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = {url, filename};
    newListing.geometry = response.body.features[0].geometry;

    let savedListing = await newListing.save();
    console.log(savedListing);
    await newListing.save();
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
};


module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing you requested for doesn't exists!");
        return res.redirect("/listings");
    }
    res.render("listings/edit.ejs", { listing });
};


module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    if(typeof req.file !== "undefined"){
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename };
        await listing.save();
    }

    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
};


module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
};