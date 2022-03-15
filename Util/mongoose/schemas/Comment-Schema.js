const mongoose = require('mongoose');

const CommentSchema =  new mongoose.Schema({
    User: {type : mongoose.Types.ObjectId , ref: "users"} ,
    Content:{type : Object,required:true},
    Type : {type : String , required : true},
    Level: {type : Number , required : true},
    Modified_Date: Date,
    Upload_Date : Date,
});

module.exports = mongoose.model("comments", CommentSchema); 