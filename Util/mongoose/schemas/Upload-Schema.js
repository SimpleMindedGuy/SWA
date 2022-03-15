const mongoose = require('mongoose');

const uploadSchema =  new mongoose.Schema({
    User: {type : mongoose.Types.ObjectId , ref: "users"},
    Comments:[{type: mongoose.Types.ObjectId , ref : "comments"}],
    Sub_Upload:[{type: mongoose.Types.ObjectId , ref : "uploads"}],
    Parent_Upload : {type : mongoose.Types.ObjectId, ref : "uploads"},
    Type: {type : String,required:true},
    Level: {type : Number , required : true},
    Content:{type : Object,required:true},
    MinRead :{type : Number,default : 99999 ,required : true},
    Group : {type : mongoose.Types.ObjectId,required : false},
    Upload_Date : Date,
    Modified_Date: Date,
});

module.exports = mongoose.model("uploads", uploadSchema); 