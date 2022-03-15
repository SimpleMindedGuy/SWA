const mongoose = require('mongoose');

const reqString = {
    type : String,
    required : true,
    unique   : true,
};

const ResourceSchema = new mongoose.Schema({
    Resource : reqString,
    Resource_Description : {type : String},
})
module.exports = mongoose.model("resources", ResourceSchema); 