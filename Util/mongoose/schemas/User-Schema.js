const mongoose = require('mongoose');

const reqString = {
    type : String,
    required : true,
};

const uniqueString={
    type : String,
    required: true,
    unique : true
}

const userSchema =  new mongoose.Schema({
    Followed_users  : [],
    Followed_uploads: [],
    Email           : String,
    User_ID         : uniqueString,
    User_Name       : reqString,
    Bio             : {type : String},
    Password        : reqString,
    Welcome         : {type : String},
    User_Image      : {type : Object},
    Cover_Image     : {type : Object},
    Upload_Date     : {type : Date , required : true},
    Modified_Date   : {type : Date },
    Last_Active     : {Type : Date},
    
    User_Groups     : [{type : String , ref : "user_groups"}],
    Skills          : [{type : mongoose.Types.ObjectId ,  ref : "skills"}],
    Contacts        : [{type : mongoose.Types.ObjectId ,  ref : "contacts"}],

    SetupAccount    : {type : Boolean},     // this option is used to check if the owner is logged in for the first time to setup the website.
                                            // used to change or keep the website default settings.

    DefaultAccount  : {type : Boolean}      // this is only used for the default user account, this is only true when resetting the website.
                                            // it's used to  create the owner account and that's it.
},
{
    toJSON: { virtuals: true }, // So `res.json()` and other `JSON.stringify()` functions include virtuals
    toObject: { virtuals: true } // So `console.log()` and other functions that use `toObject()` include virtuals
});

userSchema.virtual('Roles', {
    ref: 'user_groups', // The model to use
    localField: 'User_Groups', // Find people where `localField`
    foreignField: 'Group_Name', // is equal to `foreignField`
    options: { sort: ['Priority'] },
});

userSchema.virtual('Acts', {
    ref: 'actions', // The model to use
    localField: 'Group_Actions', // Find people where `localField`
    foreignField: 'Action', // is equal to `foreignField`
});

userSchema.virtual('Recs', {
    ref: 'resources', // The model to use
    localField: 'Group_Resources', // Find people where `localField`
    foreignField: 'Resource', // is equal to `foreignField`
});

module.exports = mongoose.model("users", userSchema); 