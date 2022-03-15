const mongoose = require('mongoose');

const reqString = {
    type : String,
    required : true,
    unique   : true,
};

const ActionSchema = new mongoose.Schema({
    Action : reqString,
    Action_Description : {type : String},
})
module.exports = mongoose.model("actions", ActionSchema); 