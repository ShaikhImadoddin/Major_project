const express =  require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const multer  = require('multer')

const Listing = require("../models/listing.js");
const {isLoggedIn, isOwner, validateListing} = require("../middleware.js");

const listingController =  require("../controllers/listings.js");
const {storage} = require("../cloudConfig.js");
const upload = multer({storage})


// Index Route & Create Route
router.route("/")
      .get(wrapAsync(listingController.index))
      .post(
        isLoggedIn,
        upload.single('listing[image][url]'),
        validateListing,
        wrapAsync(listingController.createListing)
);
    

// new route static route
router.get("/new",
        isLoggedIn,
        listingController.renderNewForm);

//  dynamic routes = Show Route & Update Route & delete route
router.route("/:id")
    .get(
        wrapAsync (listingController.showListing))
    .put(
        isLoggedIn,
        isOwner,
        upload.single("listing[image][url]"),
        wrapAsync(listingController.updateListing))
    .delete(
        isLoggedIn,
        isOwner,
        wrapAsync (listingController.destroyListing));

// Edit Route
router.get(
    "/:id/edit",
    isLoggedIn ,
    isOwner,
    wrapAsync(listingController.renderEditForm));

module.exports = router;
