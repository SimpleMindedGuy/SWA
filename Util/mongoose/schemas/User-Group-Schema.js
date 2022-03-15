const mongoose = require('mongoose');

const reqString = {
    type        : String,
    required    : true,
    unique      : true,
}

const UserGroupSchema = new mongoose.Schema({
    Group_Name          : reqString,
    Priority            : {type : Number, required : true },
    Group_Actions       : [{type : String, ref : "actions"}],
    Group_Resources     : [{type : String, ref : "resources"}],
    Group_Color         : {type : String},
    Group_Icon          : {type : mongoose.Types.ObjectId},
    Group_Members       : [{type : mongoose.Types.ObjectId, ref : "users"}],
})

UserGroupSchema.virtual('Acts', {
    ref: 'actions', // The model to use
    localField: 'Group_Actions', // Find people where `localField`
    foreignField: 'Action', // is equal to `foreignField`
});

UserGroupSchema.virtual('Recs', {
    ref: 'resources', // The model to use
    localField: 'Group_Resources', // Find people where `localField`
    foreignField: 'Resource', // is equal to `foreignField`
});
 

module.exports = mongoose.model("user_groups", UserGroupSchema); 