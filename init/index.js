const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
    .then(() => {
        console.log("Connected to DB");
    })
    .catch((err) => {
        console.log(err);
    });

async function main() {
    await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
    await Listing.deleteMany({});
    const listingWithOwner = initData.data.map((obj) => ({...obj, owner:"687d08a71be0f21394a803a6"}));
    await Listing.insertMany(listingWithOwner);
    console.log("Data was initialized");
};

initDB();