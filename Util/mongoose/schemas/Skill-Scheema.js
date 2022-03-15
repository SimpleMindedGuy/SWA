const mongoose = require('mongoose');

const reqString = {
    type : String,
    required : true,
};

const SkillSchema = new mongoose.Schema({
    skill_name : reqString,
    skill_description : {type :String , required : false},
    skill_level : {type :String , required : true},
    skill_image : {type :String , required : false}
})

module.exports = mongoose.model("skills", SkillSchema); 