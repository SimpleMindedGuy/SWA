const mongoose = require('mongoose');

const SettingSchema = new mongoose.Schema({
    AppName         : {type     : String},
    name            : {type     : String},
    options         : [{type    : String}],
    icon            : {type     : String},
    Default_Role    : {type     : String},
})
module.exports = mongoose.model("settings", SettingSchema); 