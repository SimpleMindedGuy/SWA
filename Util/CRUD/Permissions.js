const express = require('express');
const mongo = require('../mongoose/mongo');
const UserGroupSchema = require('../mongoose/schemas/User-Group-Schema');

const ActionSchema = require('../mongoose/schemas/Actions-Schema');
const ResourceSchema = require('../mongoose/schemas/Resources-Schema');


const mongoose = require("mongoose");
const register = require("./Users");


async function GetAction(Action)
{
    // console.log(`${Action} : dosent exist`)
    const success = await ActionSchema.findOne({ Action: Action})
    .then((Act)=>{
        // console.log(`${Action} : dosent exist`)
        return Act;
    })
    .catch((err)=>{
        console.log(err)
        return undefined;
    })
    // console.log(success)
    return success;
}
module.exports.GetAction = GetAction;

async function CreateAction(act,desc)
{
    console.log(act)
    console.log(desc)
    const Act = new ActionSchema({
        Action : act,
        Action_Description : desc,
    })
    if(Act.validate())
    {
        return await new ActionSchema(Act).save()
        .then(()=>{
            console.log(`Created Action ${act}`)
            return true
        })
        .catch((err)=>{
            console.log(`failed to create action (${act})`)
            return false
        })
    }
    else
    {
        console.log(`Action (${act}) invalid `)
        return false;
    }
}
module.exports.CreateAction = CreateAction;


async function setActionDescription(act,desc)
{
    const success =  await ActionSchema.findOneAndUpdate(
        {
            Action :act
        }
        ,
        {
            Action_Description : desc
        }
    )
    .then(()=>{
        console.log(`Updated Action (${act})'s description`)
        return true
    })
    .catch((err)=>{
        console.log(`failed to updated Action (${act})'s description`)
        return false
    })

    return success
}
module.exports.setActionDescription = setActionDescription;

async function DeleteAction(Action)
{
    ActionSchema.deleteOne({Action : Action})
    .then(()=>{
        console.log("Action deleted"); // Success 
        return true;
    })
    .catch((error)=>{
        console.log(error);
        return false;
    });
}
module.exports.DeleteAction = DeleteAction;

async function FindAction(Action)
{
    const success = await ActionSchema.findOne({ Action: Action})
    .then((act)=>{
            if(!act)
            {
                console.log(`${Action} : doesn't exist`)
                return false;
            }
            return true
        })
        .catch((err)=>{
            console.log(err)
            console.log(`Error while looking for Action : ${Action}`)
        return false;
    })
    // console.log(success)
    return success;
}
module.exports.FindAction = FindAction;

async function GetAllActions()
{
    const Acts = await ActionSchema.find()
    
    return Acts;
}
module.exports.GetAllActions = GetAllActions;


async function GetResource(Resource)
{
    const success = await ResourceSchema.findOne({ Resource: Resource})
    .then((Rec)=>{
        return Rec;
    })
    .catch((err)=>{
        console.log(err)
        return undefined;
    })
    return success;
}
module.exports.GetResource = GetResource;


async function CreateResource(rec,desc="")
{

    const Rec = new ResourceSchema({
        Resource : rec,
        Resource_Description : desc,
    })

    if(Rec.validate())
    {
        return await new ResourceSchema(Rec).save()
        .then(()=>{
            console.log(`Created Resource ${rec}`)
            return true
        })
        .catch((err)=>{
            console.log(`failed to create resource ${rec}`)
            return false
        })
    }
    else
    {
        console.log(`Resource ${rec} invalid`)
        return false;
    }
}
module.exports.CreateResource = CreateResource;

async function setResourceDescription(rec,desc)
{
    const success =  await ActionSchema.findOneAndUpdate(
        {
            Resource :rec
        }
        ,
        {
            Resource_Description : desc
        }
    )
    .then(()=>{
        console.log(`Updated Resource (${rec})'s description`)
        return true
    })
    .catch((err)=>{
        console.log(`failed to updated Resource (${rec})'s description`)
        return false
    })

    return success
}
module.exports.setResourceDescription = setResourceDescription;

async function DeleteResource(Resource)
{
    ResourceSchema.deleteOne({Resource : Resource})
    .then(()=>{
        console.log("Resource deleted"); // Success 
        return true;
    })
    .catch((error)=>{
        console.log(error);
        console.log("Error while deleting Resource"); // Success 
        return false;
    });
}
module.exports.DeleteResource = DeleteResource;

async function FindResource(Resource)
{
    const success = await ResourceSchema.findOne({Resource : Resource})
    .then((res)=>{
        if(!res)
        {
            console.log("Resource doesn't exist")
            return false;
        }
        // console.log()
        return true
    })
    .catch((err)=>{
        console.log(err)
        console.log("Error while looking for resource : ",Resource)
        return false;
    })
    return success;
}
module.exports.FindResource = FindResource;

async function GetAllResources()
{
    const Rec = await ResourceSchema.find();
    return Rec;
}
module.exports.GetAllResources = GetAllResources;