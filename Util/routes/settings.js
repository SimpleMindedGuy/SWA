const express = require("express");
const router = express.Router();
const upload = require("../CRUD/Uploads");
const Users = require("../CRUD/Users");

const UserGroups = require("../CRUD/User_Groups")

const TEXT = require("../Text");

const mongoose = require("mongoose")

const mongo = require("mongodb")

const UploadFiles= require("../CRUD/File_Uploads");

const ensureOwner = require("../authentication/auth").ensureOwner;

const getUserPermissions = require("../authentication/auth").getUserPermissions;

const Settings = require("../CRUD/Settings")
const AllSettings = require("../../config/App_Settings")
const Descriptions = require("../../config/App_Settings_description")

router.get("/",ensureOwner,getUserPermissions,async (req,res) => 
{
    let title="Settings"
    const user = await typeof req.user !='undefined' ? await res.locals.User : undefined;
    const userPermissions = res.locals.Permissions;
    const groups = await UserGroups.GetUserGroupsBelow(0)
    const owner = await Users.GetOwner()

    // console.log(userPermissions)

    // console.log(groups)
    const settings = await Settings.getSettings();
    // console.log(settings)
    // console.log(req.header)
    
    res.render("settings",{title:title,user:user,userPermissions,settings:settings,AllSettings,Descriptions,groups,owner});
})


router.post("/",ensureOwner,getUserPermissions,UploadFiles.UploadMiddleware,async(req,res)=>{
    const user = await typeof req.user !='undefined' ? await res.locals.User : undefined;
    const userPermissions = res.locals.Permissions;

    let error=[];
    let success=[];

    const oldsettings = await Settings.getSettings();

    console.log(req.body)
    console.log(req.body.options)

    let name, options=[],icon,Default_Role;
    // console.log(req.body)

    if(!req.body.name)
    {
        name = "Simple's Board"
    }
    else
    {
        name = req.body.name
    }

    if(!req.body.options)
    {
        options = []
    }
    else
    {
        if(Array.isArray(req.body.options))
        {
            req.body.options.forEach(option => {
                options.push(option)
            });
        }
        else
        {
            options.push(req.body.options)
        }
    }

    
    if(!req.body.Default_Role)
    {
        Default_Role = oldsettings.Default_Role;
    }
    else
    {
        Default_Role = req.body.Default_Role
    }

    if(req.body.removeimage=="on" && !req.files.image)
    {
        console.log("resetting default image")

        icon ="/icons/defult-user.svg"

        if(await oldsettings.icon != "/icons/defult-user.svg")
        {
            console.log("remove on trying to delete image")
            await UploadFiles.UploadGFS.find({
                filename : oldsettings.icon,
                metadata : "defualtImage",
            })
            .toArray(async(err,files)=>
            {
                if(!files || files.length === 0 ) return res.status(400).send("no files exists");
                if( err) return res.status(404).send(err);

                await UploadFiles.UploadGFS.find({ _id : files[0]._id}).toArray(async (error,file)=>
                {
                    if(error) return res.status(400).send("no files exists");
                    if(file) await UploadFiles.UploadGFS.delete(mongoose.Types.ObjectId(files[0]._id));
                });
            })
        }
        else
        {
            console.log("old image was not found")
        }

    }
    else if (req.files.image)
    {
        if(await oldsettings.icon != "/icons/defult-user.svg")
        {
            console.log("found file trying to remove old file")

            await UploadFiles.UploadGFS.find({
                filename : oldsettings.icon,
                metadata : "defualtImage",
            })
            .toArray(async(err,files)=>
            {
                if(!files || files.length === 0 ) return res.status(400).send("no files exists");
                if( err) return res.status(404).send(err);

                await UploadFiles.UploadGFS.find({ _id : files[0]._id}).toArray(async (error,file)=>
                {
                    if(error) return res.status(400).send("no files exists");
                    if(file) await UploadFiles.UploadGFS.delete(mongoose.Types.ObjectId(files[0]._id));
                });
            })
        }
        else
        {
            console.log("old image was not found")
        }

        icon = req.files.image[0].filename
    }
    else if(!req.files.image)
    {
        console.log("no file found")
        console.log(oldsettings)
        if(await oldsettings.icon != "/icons/defult-user.svg")
        {
            console.log("trying to delete old image")
            await UploadFiles.UploadGFS.find({
                filename : oldsettings.icon,
                metadata : "defualtImage",
            })
            .toArray(async(err,files)=>
            {
                if(!files || files.length === 0 ) return res.status(400).send("no files exists");
                if( err) return res.status(404).send(err);

                await UploadFiles.UploadGFS.find({ _id : files[0]._id}).toArray(async (error,file)=>
                {
                    if(error) return res.status(400).send("no files exists");
                    if(file) await UploadFiles.UploadGFS.delete(mongoose.Types.ObjectId(files[0]._id));
                });
            })
        }
        else
        {
            console.log("old image was not found")
        }
        icon ="/icons/defult-user.svg"
    }

    if(error.length > 0 )
    {
        console.log("there is errors")
        req.flash("error", error)
    }
    if(success.length > 0 )
    {
        console.log("there is successes")
        req.flash("success", success)
    }

    Settings.SetAppSettings(name,options,icon,Default_Role)

    res.redirect("/settings")

})
module.exports =router;