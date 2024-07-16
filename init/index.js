const mongoose = require("mongoose");
const instalizedata = require("./data.js");
const Listing = require("../models/listing.js");

main()
    .then(() => {
        console.log("connection successfull");
    })
    .catch(err => console.log(err));

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust')
}

const initDB = async () =>{
    await Listing.deleteMany({}).then(res => {console.log(res)});
    instalizedata.data = instalizedata.data.map((obj)=> ({...obj, owner : "669408fe5a9a768a6c51a291"}))
    await Listing.insertMany(instalizedata.data).then(res => {console.log(res)}).catch((err) => {console.log(err)});
    console.log("Data Was instalize");
};

initDB();