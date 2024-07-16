const Listing = require("../models/listing.js");
const ExpressError = require("../util/ExpressError.js");

module.exports.index = async (req, res) => {
    const allListing = await Listing.find({});
    res.render("listings/index.ejs", { allListing });
};

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res, next) => {
    const { id } = req.params;
    const listing = await Listing.findById(id).populate({
        path: "reviews",
        populate: {
            path: "author",
        }
    }).populate("owner");
    if (!listing) {
        return next(new ExpressError("Listing Not Found", 404));
    }
    res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res, next) => {
    const { path: url, filename } = req.file;
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url, filename };
    await newListing.save();
    req.flash("success", "Created successfully: ");
    req.flash("message", newListing.title);
    res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        res.redirect("/listings");
    }
    res.render("listings/edit.ejs", { listing });
};

module.exports.updateListing = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

    if (typeof req.file !== "undefined") {
        const { path: url, filename } = req.file;
        listing.image = { url, filename };
        await listing.save();

    }

    const listing_title = await Listing.findById(id);
    req.flash("success", "Updated successfully: ");
    req.flash("message", listing_title.title);
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    const deleteListing = await Listing.findByIdAndDelete(id);
    if (!deleteListing) {
        return next(new ExpressError("Listing Not Found", 404));
    }
    req.flash("message", listing.title);
    req.flash("warning", "Deleted successfully");
    res.redirect("/listings");
};
