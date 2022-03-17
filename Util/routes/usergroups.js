const express = require("express");
const router = express.Router();
const upload = require("../CRUD/Uploads");
const Users = require("../CRUD/Users");

const UserGroups = require("../CRUD/User_Groups")

const TEXT = require("../Text");

const mongoose = require("mongoose")

const mongo = require("mongodb")

const UploadFiles= require("../CRUD/File_Uploads");

const getUserPermissions = require("../authentication/auth").getUserPermissions;

const Permissions=  require("../CRUD/Permissions")

const Settings = require("../CRUD/Settings")




//  this id well be used to refer to post with images , so that we can track what image/file belongs to what post


router.get("/",getUserPermissions,async (req,res) => 
{
    let title="User Groups"
    const user = await typeof req.user !='undefined' ? await res.locals.User : undefined;
    const userPermissions = res.locals.Permissions;
    const settings = await Settings.getSettings()
    const Def_Role = settings.Default_Role;
    const owner = await Users.GetOwner()

    // console.log(userPermissions)

    const Act = await Permissions.GetAllActions();
    const Rec = await Permissions.GetAllResources();
    const groups = await UserGroups.GetAllUserGroups();
    // console.log(userPermissions)
    res.render("permission",{title:title,user:user,groups,userPermissions,Act,Rec,Def_Role,owner,settings});
})

router.put("/",getUserPermissions,async(req,res)=>{
    const user = await typeof req.user !='undefined' ? await res.locals.User : undefined;
    const userPermissions = res.locals.Permissions;
    
    console.log(req.body)
    for(const Role in req.body)
    {
        console.log(Role)
        console.log(req.body[Role])
        await UserGroups.setGroupPriority(Role,req.body[Role])
    }
    res.redirect("/usergroups")
})

router.post("/",getUserPermissions,async(req,res)=>{
    const user = await typeof req.user !='undefined' ? await res.locals.User : undefined;
    const userPermissions = res.locals.Permissions;
    let error=[];
    let success=[];
    // console.log(req.body)
    if(userPermissions.Values.hasOwnProperty("writeroles"))
    {
        const Role = await TEXT.RemoveWhiteSpace(req.body.Group_Name)
        // console.log(Role)
        if(! await TEXT.ValidateUserName(Role))
        {
            if(! await UserGroups.FindUserGroup(Role))
            {
                req.flash('error',`Group name is already used`)
            }
            else
            {
                const grp = await UserGroups.GetAllUserGroups()
                UserGroups.CreateUserGroup(Role,grp.length-1)
            }
        }
        else
        {
            req.flash('error',`Invalid Group Name`)
        }
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
    
    res.redirect("/usergroups")
})

router.post("/done",getUserPermissions,async(req,res)=>{
    const user = await typeof req.user !='undefined' ? await res.locals.User : undefined;
    const userPermissions = res.locals.Permissions;
    let error=[];
    let success=[];
    // console.log(req.body)

    if(user && user.SetupAccount)
    {
        req.flash("success", "setup profile")
        res.redirect(`/users/${user.id}`)
    }
    else
    {
        req.flash("error","you're not supposed to access this page")
        res.redirect("/home")
    }
})


router.put("/:Group_Name",getUserPermissions,UploadFiles.UploadMiddleware,async(req,res)=>{
    const user = await typeof req.user !='undefined' ? await res.locals.User : undefined;
    const userPermissions = res.locals.Permissions;
    let error=[];
    let success=[];
    
    let acts = [];
    let recs =[];

    // console.log(req.body)

    // console.log(userPermissions)

    const grp = await UserGroups.GetUserGroup(req.params.Group_Name)

    if(grp && grp.Priority > userPermissions.Values["manageroles"])
    {
        if(Array.isArray(req.body.Actions))
        {
            req.body.Actions.forEach((Act)=>{
                if(userPermissions.Act.includes(Act))
                    acts.push(Act)
            })
        }
        else
        {
            if(userPermissions.Act.includes(req.body.Actions))
                acts.push(req.body.Actions)
        }

        if(Array.isArray(req.body.Resources))
        {
            req.body.Resources.forEach((Rec)=>{
                if(userPermissions.Rec.includes(Rec))
                    recs.push(Rec)
            })
        }
        else
        {
            if(userPermissions.Rec.includes(req.body.Resources))
                recs.push(req.body.Resources)
        }

        UserGroups.setGroupActions(req.params.Group_Name,acts)
        UserGroups.setGroupResources(req.params.Group_Name,recs)
    }
    else
    {
        error.push("you dont have permission to manage roles permissions")
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

    res.redirect("/usergroups")
})


router.delete("/:Group_Name",getUserPermissions,async(req,res)=>{
    const user = await typeof req.user !='undefined' ? await res.locals.User : undefined;
    const userPermissions = res.locals.Permissions;
    const settings = await Settings.getSettings()
    const Def_Role = settings.Default_Role;
    let error=[];
    let success=[];
    

    console.log(req.body)

    const grp = await UserGroups.GetUserGroup(req.params.Group_Name)

    if(grp && grp.Priority > userPermissions.Values["deleteroles"] && gro.Group_Name != Def_Role)
    {
        if(grp.Group_Members)
        {
            for(const memeber of grp.Group_Members)
            {
                await UserGroups.RemoveGroupMember(grp.Group_Name,memeber)
            }
        }
        await UserGroups.DeleteGroup(grp.Group_Name)
        success.push("group deleted")
    }
    else
    {
        error.push("you dont have permission to manage roles permissions")
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

    res.redirect("/usergroups")
})



module.exports =router;