const upload = require("../CRUD/Uploads");
const UserGroups = require("../CRUD/User_Groups")
const Users = require("../CRUD/Users");
const UploadFiles= require("../CRUD/File_Uploads");


const TEXT = require("../Text");

const mongoose = require("mongoose")
const mongo = require("mongodb")

async function RemoveUsersFromGroups(req,res,user,userPermissions,ReqUsers,ReqGroups,settings){

    let error=[];
    let success=[];
    if(Array.isArray(ReqUsers))
    {
        for(const USR of ReqUsers){
            
            const usr = await Users.GetUserByUserID(USR)
            if(usr && usr.Roles[0].Priority > userPermissions.Values["manageusers"])
            {
                
                if(Array.isArray(ReqGroups))
                {
                    for(const GRP of ReqGroups){
                        const grp = await UserGroups.GetUserGroup(GRP)
                        if(grp)
                        {
                            if(grp.Priority > userPermissions.Values["manageusers"])
                            {
                                await UserGroups.RemoveGroupMember(GRP,usr.id)
                            }
                            else
                            {
                                console.log(`cant manage user ${USR} roles`);
                            }
                        }
                    }
                }
                else
                {
                    const grp = await UserGroups.GetUserGroup(ReqGroups)
                    if(grp)
                    {
                        if(grp.Priority > userPermissions.Values["manageusers"])
                        {
                            await UserGroups.RemoveGroupMember(ReqGroups,usr.id)
                        }
                        else
                        {
                            console.log(`cant manage user ${usr} roles`);
                        }
                    }
                }
    
                
            }
            else
            {
                console.log(`cant manage user ${USR} roles`);
            }
        }
    }
    else
    {
        const usr = await Users.GetUserByUserID(ReqUsers)
        if(user && usr.Roles[0].Priority > userPermissions.Values["manageusers"])
        {
            console.log(`can manager user ${ReqUsers} roles`);
    
            if(Array.isArray(ReqGroups))
            {
                for(const GRP of ReqGroups){
                    const grp = await UserGroups.GetUserGroup(GRP)
                    if(grp)
                    {
                        console.log(GRP)
                        if(grp.Priority > userPermissions.Values["manageusers"])
                        {
                            console.log(usr)
                            await UserGroups.RemoveGroupMember(GRP,usr.id)
                        }
                        else
                        {
                            console.log(`cant manage user ${ReqUsers} roles`);
                        }
                    }
                }
            }
            else
            {
                const grp = await UserGroups.GetUserGroup(ReqGroups)
                if(grp)
                {
                    if(grp.Priority > userPermissions.Values["manageusers"])
                    {
                        await UserGroups.RemoveGroupMember(ReqGroups,usr.id)
                    }
                    else
                    {
                        console.log(`cant manage user ${usr} roles`);
                    }
                }
            }
        }
        else
        {
            console.log(`cant manage user ${usr} roles`);
        }
    }

    if(error.length > 0 )
    {
        // console.log("there is errors")
        req.flash("error", error)
    }
    if(success.length > 0 )
    {
        // console.log("there is successes")
        req.flash("success", success)
    }
}
module.exports.RemoveUsersFromGroups = RemoveUsersFromGroups;

async function DeleteUsers(req,res,user,userPermissions,ReqUsers,ReqGroups,settings){

    let error=[];
    let success=[];
    if(Array.isArray(ReqUsers))
    {
        for(const USR of ReqUsers){
            
            const usr = await Users.GetUserByUserID(USR)
            if(usr && usr.Roles[0].Priority > userPermissions.Values["deleteusers"])
            {
                Users.DeleteUserByUserID(usr.User_ID)
            }
            else
            {
                console.log(`cant manage user ${USR} roles`);
            }
        }
    }
    else
    {
        const usr = await Users.GetUserByUserID(ReqUsers)
        if(user && usr.Roles[0].Priority > userPermissions.Values["deleteusers"])
        {
            Users.DeleteUserByUserID(usr.User_ID)
        }
        else
        {
            console.log(`cant manage user ${usr.User_ID} roles`);
        }
    }

    if(error.length > 0 )
    {
        // console.log("there is errors")
        req.flash("error", error)
    }
    if(success.length > 0 )
    {
        // console.log("there is successes")
        req.flash("success", success)
    }
}
module.exports.DeleteUsers = DeleteUsers;