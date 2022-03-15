const mongoose = require('mongoose');



const ContactSchema = new mongoose.Schema({
    Contact_icon : {type :String },
    Contact_link : {type :String },
    Contact_method : {type :String },
})

module.exports = mongoose.model("contacts", ContactSchema); 