const mongoose =  require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");


const Defaultlink = "https://images.unsplash.com/photo-1742853288141-b95880a1c5ea?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

const listingSchema = new Schema ({
    title:{
        type: String,
        required: true,
    },
    description: String,
    image: {
        filename: {
            type: String,
            default: 'defaultfile'
        },
        url: {
            type: String,
            default: Defaultlink,
            set: (v) => v === "" ? Defaultlink : v,
        }
},
    price: Number,
    location: String,
    country: String,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review",
        },  
    ],
    owner:{
            type: Schema.Types.ObjectId,
            ref: "User",
    },
});

listingSchema.post("findOneAndDelete", async(listing) => {
    if(listing){
        await Review.deleteMany({_id : {$in: listing.reviews}});
    }
});

const Listing = mongoose.model("Listing",listingSchema);
module.exports = Listing;


