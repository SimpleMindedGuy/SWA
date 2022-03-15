const mongo = require('../mongoose/mongo');
const mongoose = require("mongoose")
const UploadFiles= require("./File_Uploads");

const SettingSchema = require("../mongoose/schemas/WebsiteSettings-Schema");

const Def_Settings = require("../../config/AppDefaultSettings")


async function CreateDefaultSettings()
{
    // console.log(Def_Settings)
    return await SettingSchema.findOne({AppName : "Simple website"})
    .then(async (setting)=>{
        if(setting == null || setting == undefined)
        {
            console.log("creating setting")
            await new SettingSchema(Def_Settings).save()
            .then(()=>
            {
                console.log("Settings been set to default")
                return true
            })
            .catch((err)=>{
                console.log(err)
                console.log("something went wrong while setting default settings")
                return false
            })
        }
        else
        {
            return await SettingSchema.findOneAndUpdate(
                {AppName : "Simple website"},
                {
                    Def_Settings
                },
            )
            .then(()=>{
                console.log("Settings been set to default")
                return true
            })
            .catch((err)=>{
                console.log(err)
                console.log("something went wrong while setting defualt settings")
                return false
            })
        }
    })
    .catch(async (err)=>{
        console.log(err)
        console.log("Something went wrong while looking for App settings")
        return false
    })

    
}
module.exports.CreateDefaultSettings = CreateDefaultSettings;

async function SetAppSettings(name,options,icon,Default_Role){
    return await SettingSchema.findOne({AppName : "Simple website"})
    .then(async(setting)=>{
        if(setting == null || setting == undefined)
        {
            console.log("Settings dont exit")
            const SET = {
                AppName : "Simple website",
                options ,
                name,
                icon,
                Default_Role
            }
            console.log("Creating settings")

            return await new SettingSchema(SET).save()
            .then(()=>
            {
                console.log("Settings been changed")
                return true
            })
            .catch((err)=>{
                console.log(err)
                console.log("something went wrong while changing App settings")
                return false
            })
        }
        await SettingSchema.findOneAndUpdate(
            {AppName : "Simple website"},
            {$set:{options,name,icon,Default_Role}}
        )
        .then(()=>{
            console.log("App settings updated")
            return true
        })
        .catch((err)=>{
            console.log(err)
            console.log("Something went wrong while changing App Settings")
            return false;
        })
    })
    .catch(async(err)=>{
        console.log(err)
        console.log("Something went wrong while looking for App settings")
        return false
    })
}
module.exports.SetAppSettings = SetAppSettings;


async function getSettings()
{
    return await SettingSchema.findOne({AppName : "Simple website"})
    .then(async (setting)=>{
        if(setting == null || setting == undefined)
        {
            console.log("creating setting")
            await new SettingSchema(Def_Settings).save()
            .then((SET)=>
            {
                console.log("Settings been set to default")
                return SET
            })
            .catch((err)=>{
                console.log(err)
                console.log("something went wrong while setting defualt settings")
                return null
            })
        }
        else
        {
            return await SettingSchema.findOne({AppName : "Simple website"})
            .then((SET)=>{
                return SET
            })
            .catch((err)=>{
                console.log(err)
                console.log("something went wrong while setting defualt settings")
                return null
            })
        }
    })
    .catch(async (err)=>{
        console.log(err)
        console.log("Something went wrong while looking for App settings")
        return null
    })
}
module.exports.getSettings = getSettings;