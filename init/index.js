if(process.env.NODE_ENV != "production"){
    require("dotenv").config();
}

const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const dbUrl = process.env.ATLASDB_URL;

main()
    .then(() => {
        console.log("Connected to DB");
    })
    .catch((err) => {
        console.log(err);
    });

async function main() {
    await mongoose.connect(dbUrl);
}

const initDB = async () => {
    await Listing.deleteMany({});
    const listingWithOwner = initData.data.map((obj) => ({...obj, owner:"687d08a71be0f21394a803a6"}));
    await Listing.insertMany(listingWithOwner);
    console.log("Data was initialized");
};

initDB();