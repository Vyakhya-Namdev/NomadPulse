const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = 'mongodb://127.0.0.1:27017/nomadpulse';

main()
    .then((res) => {
        console.log("Connected to database");
    }).catch(err => {
        console.log(err);
    })
async function main(){
    await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
    await Listing.deleteMany({});
    //to add some additional data in DB
    initData.data = initData.data.map((obj) => ({...obj, owner: "683331c79639915cb63da7a5"}));
    await Listing.insertMany(initData.data);
    console.log("Data was initialised");
}

initDB();