const express = require('express');
const app = express();

const mongoose = require ('mongoose')
const UserGroupSchema = require('../mongoose/schemas/User-Group-Schema')
const ActionsSchema = require('../mongoose/schemas/Actions-Schema')
const ResourcesSchema = require('../mongoose/schemas/Resources-Schema')

const User = require('./Users');

const Permissions = require('./Permissions')


async function GetUserGroup(group)
{
    const success = await UserGroupSchema.findOne({Group_Name : group })
    .populate("Recs")
    .populate("Acts")
    .then((grp)=>{
        if(grp)
        {
            return grp;
        }
        return undefined;
    })
    .catch((err)=>{
        console.log(err);
        return undefined;
    })

    return success;
}
module.exports.GetUserGroup = GetUserGroup;


async function GetUserGroupsBelow(level = 0)
{
    const Namefilter = /Anon/;
    const success = await UserGroupSchema.find({Priority : {$gt:level},Group_Name :{$not :  Namefilter }  })
    .populate("Recs")
    .populate("Acts")
    .then((grp)=>{
        if(grp)
        {
            return grp;
        }
        return undefined;
    })
    .catch((err)=>{
        console.log(err);
        return undefined;
    })

    return success;
}
module.exports.GetUserGroupsBelow = GetUserGroupsBelow;


async function GetUserGroupsAbove(level)
{
    const Namefilter = /Owner/g;
    const success = await UserGroupSchema.find({Priority : {$lt:level}, $not : { Group_Name : Namefilter} })
    .populate("Recs")
    .populate("Acts")
    .then((grp)=>{
        if(grp)
        {
            return grp;
        }
        return undefined;
    })
    .catch((err)=>{
        console.log(err);
        return undefined;
    })

    return success;
}
module.exports.GetUserGroupsAbove = GetUserGroupsAbove;

async function FindUserGroup(group)
{
    const sucess = await UserGroupSchema.find(
        {Group_Name : group },(err,grp)=>{
            if(err){
                console.log(err);
                return false
            }
            if(grp)
                return true;
            return false;
        })
    return sucess;

}
module.exports.FindUserGroup = FindUserGroup;

async function GetAllUserGroups()
{

    const Groups = await UserGroupSchema.find().sort({Priority : +1})


    // console.log(Groups);
    return Groups;

}
module.exports.GetAllUserGroups = GetAllUserGroups;

async function GetUserGroupsName(Group)
{
    const Groups = await UserGroupSchema.findOne({
        Group_Name : Group,
    },(err,group)=>{
        if(err)
        {
            console.log(err);
            return null;
        }
        if(group)
        {
            return group;
        }
    })


    // console.log(Groups);
    return Groups;

}
module.exports.GetUserGroupsName = GetUserGroupsName;

async function CreateUserGroup(group,index)
{
    console.log(index)
    if(! FindUserGroup(group))
    {
        console.log("group already exists")
        return false;
    }
    else
    {
        const Group ={
            Group_Name : group,
            Priority : index
        }
        const anon = await GetUserGroup("Anon");
        if(! anon){
            const success = await new UserGroupSchema(Group).save()
            .then(newGroup => {
                return true;
            })
            .catch(err => {
                console.log(err)
                return false;
            });
            return success;

        }
        else
        {
            const success = await new UserGroupSchema(Group).save()
            .then(async (newGroup) => {
                await UserGroupSchema.findOneAndUpdate(
                    {Group_Name : "Anon"},
                    {Priority : (index+1)}
                )
                .then(()=>{
                    console.log("Moved anon")
                    return true
                })
                .catch((err)=>{
                    console.log(err)
                    console.log("Could not change Anon group priority")
                    return false;
                })
            })
            .catch(err => {
                console.log("Could not create group")
                console.log(err)
                return false;
            });
            return success;

        }


    
    }
}
module.exports.CreateUserGroup = CreateUserGroup;


async function DeleteGroup(group)
{

    await UserGroupSchema.findOne({Group_Name : group})
    .then(async (G)=>{
        console.log("Deleting Group : ",group); // succes
        if(G.Group_Members)
        {
            console.log("Removing UserGroups From members")
            await G.Group_Members.forEach(member =>{
                User.RemoveUserFromUserGroup(member, group)
            })
        }
        return await UserGroupSchema.deleteOne({Group_Name : group})
        .then(()=>{
            return true
        })
        .catch(()=>{
            return false;
        })
    })
    .catch((error)=>{
        console.log(error);
        return false
    });
}
module.exports.DeleteGroup = DeleteGroup;


async function FindUserGroupAction(group,action)
{
    const sucess = await UserGroupSchema.find(
        {
            Group_Name : group ,
            Group_Action : action,
        },(err,grp)=>{
            if(err){
                console.log(err);
                return false
            }
            if(grp)
                return true;
            return false;
        })
    return sucess;

}
module.exports.FindUserGroupAction = FindUserGroupAction;

async function AddGroupAction(group,Action)
{
    const Act = await ActionsSchema.findOne({Action})
    .then(async(action)=>{
        // console.log(`Action : ${act}`)
        return await UserGroupSchema.findOneAndUpdate(
            {Group_Name : group},
            {$addToSet:{Group_Actions: action.Action}})
            .then((act)=>{
                if(act)
                {
                    // console.log(act)
                    console.log(`Added Action : (${Action}) to user group (${group})`)
                    return true
                }
                else
                {
                    console.log(`Failed to add action : (${Action}) to user group (${group})`)
                    return false
                }
            })
            .catch((err)=>{
                // console.log(err)
                console.log(`something went wrong while adding Action : (${Action}) to usergroup (${group})`)
                return false
            })
    })
    .catch((err)=>{
        // console.log(err)
        console.log(`could not find action (${Action})`)
        return false

    })
    return Act;
    // console.log(`Action ${Act}`)

}
module.exports.AddGroupAction = AddGroupAction;

async function DeleteGroupAction(group,Action)
{
    const success = await UserGroupSchema.findOneAndUpdate(
        {Group_Name : group},
        {$pull:{'Group_Actions':Action}}
    )
    .then(()=>{
        console.log(`Removed Action : (${Action})  to user group (${group})`)

        return true
    })
    .catch((err)=>{
        console.log(err)
        console.log(`Failed to remove Action : (${Action})  to user group (${group})`)
        return false
    })

    return success
    
}
module.exports.DeleteGroupAction = DeleteGroupAction;



async function setGroupActions(group,Actions)
{
    console.log(Actions)
    for (const Action in Actions) {
        
        if(! await Permissions.FindAction(Actions[Action]))
            Actions.splice(Actions[Action]-1,1)
    
    }
    const Act = await UserGroupSchema.findOneAndUpdate(
        {Group_Name : group},
        {$set:{Group_Actions: Actions}})
        .then((act)=>{
            if(act)
            {
                // console.log(act)
                console.log(`user group (${group}) set to ${Actions}`)
                return true
            }
            else
            {
                console.log(`Failed to set user group (${group}) Actions`)
                return false
            }
        })
        .catch((err)=>{
            // console.log(err)
            console.log(`something went wrong while seting Actions : (${Action}) to usergroup (${group})`)
            return false
        })

    return Act;
    // console.log(`Action ${Act}`)

}
module.exports.setGroupActions = setGroupActions;

////////////////////////////
//////////////////////////////
////////////////////////////


async function FindUserGroupResource(group,resource)
{
    const sucess = await UserGroupSchema.find(
        {
            Group_Name : group ,
            Group_Resource : resource,
        },(err,grp)=>{
            if(err){
                console.log(err);
                return false
            }
            if(grp)
            {
                console.log(grp)
                return true;
            }
            return false;
        })
    return sucess;

}
module.exports.FindUserGroupResource = FindUserGroupResource;

async function AddGroupResource(group,Resource)
{
    const Rec = await ResourcesSchema.findOne({Resource})
    .then(async(resource)=>{
        // console.log(`resource : (${Resource})`)
        // console.log(`resource : ${resource}`)
        return await UserGroupSchema.findOneAndUpdate(
            {Group_Name : group},
            {$addToSet:{Group_Resources: resource.Resource}})
            .then((rec)=>{
                if(rec)
                {
                    console.log(`Added Resource : (${Resource})  to user group (${group})`)
                    return true
                }
                else
                {
                    console.log(`failed to add Action : (${Resource})  to user group (${group})`)
                    return false
                }
            })
            .catch((err)=>{
                console.log(`something went wrong while adding resource : (${Resource}) to user group (${group})`)
                console.log(err)
                return false
            })
    })
    .catch((err)=>{
        console.log(err)
        console.log(`could not find Resource (${Resource})`)
        return false

    })
    return Rec;
}
module.exports.AddGroupResource = AddGroupResource;

async function DeleteGroupResources(group,Resource)
{
    const success = await UserGroupSchema.findOneAndUpdate(
        {Group_Name : group},
        {$pull:{'Group_Resources':Resource}}
        )
        .then(()=>{
            console.log(`Removed Resource : (${Resource}) from user group (${group})`)
            return true
        })
        .catch((err)=>{
            console.log(err)
            console.log(`Failed to Remove Resource : (${Resource}) from user group (${group})`)
            return false
        })

    return success
    
}
module.exports.DeleteGroupResources = DeleteGroupResources;

async function setGroupResources(group,Resources=[])
{
    console.log(Resources)
    for (const Resource in Resources) {
        if(! await Permissions.FindResource(Resources[Resource]))
            Resources.splice(Resources[Resource]-1,1)
    
    }
    const Act = await UserGroupSchema.findOneAndUpdate(
        {Group_Name : group},
        {$set:{Group_Resources: Resources}})  
        .then((act)=>{
            if(act)
            {
                // console.log(act)
                console.log(`user group (${group}) set to ${Resources}`)
                return true
            }
            else
            {
                console.log(`Failed to set user group (${group}) Resources`)
                return false
            }
        })
        .catch((err)=>{
            // console.log(err)
            console.log(`something went wrong while seting Resources : (${Action}) to usergroup (${group})`)
            return false
        })

    return Act;
    // console.log(`Action ${Act}`)

}
module.exports.setGroupResources = setGroupResources;


async function setGroupPriority(group,Priority )
{

    const Act = await UserGroupSchema.findOneAndUpdate(
        {Group_Name : group},
        {$set:{Priority: Priority}})  
        .then((act)=>{
            if(act)
            {
                // console.log(act)
                console.log(`user group (${group}) set to ${Priority}`)
                return true
            }
            else
            {
                console.log(`Failed to set user group (${group}) Priority`)
                return false
            }
        })
        .catch((err)=>{
            // console.log(err)
            console.log(`something went wrong while setting to usergroup (${group})'s priority to  (${Priority})`)
            return false
        })

    return Act;
    // console.log(`Action ${Act}`)

}
module.exports.setGroupPriority = setGroupPriority;


async function AddGroupMember(group,id)
{
    const user = await User.GetUserById(id)
    if(! await FindUserGroup(group))
    {
        console.log("group does not exist")
        return false;
    }
    else if(!user){
        console.log("user does not exist")
    }
    else
    {
        const success = await  UserGroupSchema.findOneAndUpdate({Group_Name : group},
            {$addToSet: {Group_Members : id}})
        .then(() => {
            User.AddGroupToUser(user._id, group);
            return true;
        })
        .catch((err) => {
            console.log(err)
            return false;
        });
    
        return success;
    }
}
module.exports.AddGroupMember = AddGroupMember;


async function RemoveGroupMember(group,id)
{
    const user = await User.GetUserById(id)
    if(!await FindUserGroup(group))
    {
        console.log("group does not exist")
        return false;
    }
    else if(!user){
        console.log("user does not exist")
    }
    else
    {
        
    
        const success = await  UserGroupSchema.findOneAndUpdate({Group_Name : group},
            {$pull: {Group_Members : id}})
        .then(() => {
            
            User.RemoveUserFromUserGroup(user.id, group);
            return true;
        })
        .catch((err) => {
            console.log(err)
            return false;
        });
    
        return success;
    }
}
module.exports.RemoveGroupMember = RemoveGroupMember;


async function ChangeUserGroupColor(group,color)
{
    const success = await UserGroupSchema.findOneAndUpdate(
        {Group_Name : group },
        {Group_Color : color})
        .then(()=>{
            console.log(`Changed UserGroup : (${group}) Color to : ${color}`)
        })
        .catch(err =>{

        })
    return success;
}
module.exports.ChangeUserGroupColor = ChangeUserGroupColor;