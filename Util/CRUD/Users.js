const express = require('express');
const app = express();

const mongoose = require ('mongoose')
const UserSchema = require('../mongoose/schemas/User-Schema');
const SkillSchema = require('../mongoose/schemas/Skill-Scheema');
const ContactSchema = require('../mongoose/schemas/Contact-Scheema');

const Permissions = require('./Permissions');
const UserGroups = require('./User_Groups');


const UploadFiles= require("./File_Uploads");

const TEXT = require("../Text")

async function GetAllUsers()
{
    const users =  UserSchema.find()
    .populate({
        path: 'Roles',
        options: { sort: '-Priority' },
        // populate : {path : "Acts" }
    })
    .populate({
        path: 'Roles',
        options: { sort: '-Priority' },
        // populate : {path : "Recs" }
    })
    .populate("Skills")
    .populate("Contacts")
    .then(async (user)=>{
        // await user.populate('Recs')
        // await user.populate('Acts')
        return user
    })
    .catch((err)=>{
        console.log(err)
        console.log(`something went wrong while getting a user`)
    })

    // const DB = await UserSchema.find({});
    // console.log(DB);
    return users

}
module.exports.GetAllUsers= GetAllUsers;

async function GetOwner()
{
    const users =  UserSchema.findOne({User_Groups : "Owner"})
    .populate({
        path: 'Roles',
        options: { sort: '-Priority' },
        // populate : {path : "Acts" }
    })
    .populate({
        path: 'Roles',
        options: { sort: '-Priority' },
        // populate : {path : "Recs" }
    })
    .populate("Skills")
    .populate("Contacts")
    .then(async (user)=>{
        // await user.populate('Recs')
        // await user.populate('Acts')
        return user
    })
    .catch((err)=>{
        console.log(err)
        console.log(`something went wrong while getting a user`)
    })

    // const DB = await UserSchema.find({});
    // console.log(DB);
    return users

}
module.exports.GetOwner= GetOwner;

async function GetAllUsersOfGroup(group)
{
    const users =  UserSchema.find({User_Groups : group})
    .populate({
        path: 'Roles',
        options: { sort: '-Priority' },
        // populate : {path : "Acts" }
    })
    .populate({
        path: 'Roles',
        options: { sort: '-Priority' },
        // populate : {path : "Recs" }
    })
    .populate("Skills")
    .populate("Contacts")
    .then(async (user)=>{
        // await user.populate('Recs')
        // await user.populate('Acts')
        return user
    })
    .catch((err)=>{
        console.log(err)
        console.log(`something went wrong while getting a user`)
    })

    // const DB = await UserSchema.find({});
    // console.log(DB);
    return users

}
module.exports.GetAllUsersOfGroup = GetAllUsersOfGroup;

async function FindUsersOfGroup(group)
{
    const success =  UserSchema.find({User_Groups : group})
    .populate({
        path: 'Roles',
        options: { sort: '-Priority' },
        // populate : {path : "Acts" }
    })
    .populate({
        path: 'Roles',
        options: { sort: '-Priority' },
        // populate : {path : "Recs" }
    })
    .populate("Skills")
    .populate("Contacts")
    .then(async (user)=>{
        // await user.populate('Recs')
        // await user.populate('Acts')
        if(user.length > 0)
            return true
        else return false
    })
    .catch((err)=>{
        console.log(err)
        console.log(`something went wrong while getting a user`)
        return false;
    })

    // const DB = await UserSchema.find({});
    // console.log(DB);
    return success

}
module.exports.FindUsersOfGroup = FindUsersOfGroup;

async function GetUsersNumber()
{

    const users = await UserSchema.find()
    // console.log(users.length)
    // const DB = await UserSchema.find({});
    // console.log(users);
    return users.length

}
module.exports.GetUsersNumber= GetUsersNumber;

async function CreateDefaultOwner()
{
    console.log("Creating owner")

    if(! await FindUsersOfGroup("Owner"))
    {

        const Password = await TEXT.EncryptText("123")
        // creating user 
        const user = {
            User_ID : "user",
            User_Name : "user",
            Password,
            DefaultAccount : true,
            Upload_Date : Date.now(),
        }
        const success =  await UserSchema.validate(user)
        .then(async()=>{
                return await new UserSchema(user).save()
                .then(async (user) => {
                    // console.log("user has been created "+user)
                    // console.log("user._id "+user._id)
                    // console.log(`Adding new user : (${user.User_Name}) to UserGroup (${group}) `)
                    await UserGroups.AddGroupMember("Owner" , user._id); 
                    console.log("Created owner")
                    return true;
                })
                .catch(err => { 
                    // return success;
                    console.log("Failed to create owner")
                    return false;
                });
            }
        )
        .catch(()=>{
            console.log("invalid user information")
            return false
        })
        // console.log("Success : ",success)
        return success;
    }
    else
    {
        console.log("Cant have more than one owner")
        return false
    }
}
module.exports.CreateDefaultOwner = CreateDefaultOwner;

async function finishSetup()
{
    return await UserSchema.findOneAndUpdate(   {User_Groups  : "Owner"},
                                                {SetupAccount : false})
    .then((user)=>{
        if(user)
            return true;
        return false;
    })
    .catch((err)=>
    {
        console.log(err)
        return false
    })
}
module.exports.finishSetup = finishSetup;

async function CreateUser(Email,User_ID,User_Name,Password,group,Date)
{
    console.log("Creating user")


    // creating user 
    const user = (group == "Owner") 
    ? {Email, User_ID,User_Name,Password,Upload_Date : Date,SetupAccount : true}  // if the group is "Owner" then add the value SetupAccount
    : {Email, User_ID,User_Name,Password,Upload_Date : Date,}                     // if the group is not "Owner" then create normal account

    
     
    return await UserSchema.validate(user).then(async()=>{
            return await new UserSchema(user).save()
            .then(async (user) => {
                // console.log("user has been created "+user)
                // console.log("user._id "+user._id)
                // console.log(`Adding new user : (${user.User_Name}) to UserGroup (${group}) `)
                await UserGroups.AddGroupMember(group , user._id);
                return true;
            })
            .catch(err => {
                // console.log(err)
                // return success;
                return false;
            });
        }
    )
    .catch(()=>{
        console.log("invalid user information")
        return false
    })
    
    

}
module.exports.CreateUser= CreateUser;

async function FindUserNameId(UserID)
{
    // checking for data
    const result = await UserSchema.findOne({"User_ID" : UserID},(err,user)=>{
        if (err) 
            return false;
        if(user)
        {
            return true;
        }
        else
        {
            return false
        }
    });
    return result;
}
module.exports.FindUserNameId = FindUserNameId;

async function FindEmail(Email)
{
    await UserSchema.findOne({"email" : Email},(err,user)=>{
        if (err) 
            return false;
        if(user)
        {
            return true;
        }
        else
        {
            return false
        }
    })
}
module.exports.FindEmail = FindEmail;

async function FindUserNameNumber(UserName , UserNumber)
{
    // checking for data
    await UserSchema.findOne({"username" : UserName , "usernumber" : UserNumber},(err,user)=>{
        if(err)
        {
            console.log(err)
            return false
        }
        if(user) {
            return true
        }
        else {
            return false
        }

    })

}
module.exports.FindUserNameNumber=FindUserNameNumber;

async function GetUserById(_id)
{

    const User = await UserSchema.findOne({_id: mongoose.Types.ObjectId(_id)})
    .populate({
        path: 'Roles',
        options: { sort: '-Priority' },
        // populate : {path : "Group_Resources" }
    })
    .populate({
        path :"Skills",
    })
    .populate({
        path : "Contacts",
    })
    .then((usr)=>{
        
        // usr.populate('Recs')
        // usr.populate('Acts')
        return usr
    })
    .catch((err)=>{
        console.log(err)
        console.log(`\n\n\n something went wrong while getting a user`)
        return undefined
    })

    // console.log(User.Roles)

    return User
}
module.exports.GetUserById=GetUserById;

async function GetUserByUserID(UserID)
{

    const User = await UserSchema.findOne({User_ID: UserID})
    .populate({
        path: 'Roles',
        options: { sort: '-Priority' },
        // populate : {path : "Acts" }
    })
    .populate({
        path: 'Roles',
        options: { sort: '-Priority' },
        // populate : {path : "Recs" }
    })
    .populate("Skills")
    .populate("Contacts")
    .then(async (user)=>{
        // await user.populate('Recs')
        // await user.populate('Acts')
        return user
    })
    .catch((err)=>{
        console.log(err)
        console.log(`something went wrong while getting a user`)
        return undefined
    })

    // console.log(User.Roles)
    // console.log(User)
    // console.log(User.Roles)
    return User


}
module.exports.GetUserByUserID=GetUserByUserID;

async function UpdateUser(id,User_Name,Welcome,Bio,Date){
    let name;
    await UserSchema.findOneAndUpdate( 
        {_id : mongoose.Types.ObjectId(id)},    
        {
            User_Name,
            Welcome,
            Bio,
            Modified_Date : Date,
        },
        (err,user)=>
        {
            name = user.User_ID;
        }
    )
    .then((user)=>{
        if(user)
            return true
        else
            return false
    })
    .catch(err=>{
        console.log(`error while updating user image from user  : ${name}\nerr : ${err}`)
        return false
    })
}
module.exports.UpdateUser=UpdateUser;


async function UpdateImage(id,User_Image){
    let name
    await UserSchema.findOneAndUpdate(
        {_id : mongoose.Types.ObjectId(id)},
        {
            User_Image : User_Image
        },
        (err,user)=>
        {
            name = user.User_ID;
        }
    )
    .then((user)=>{
        if(user)
        {
            console.log("user")
            return true
        }
        console.log("no user")
        return false
    })
    .catch(err=>{
        console.log(`error while updating user image from user  : ${name}\nerr : ${err}`)
        return false
    })

}
module.exports.UpdateImage=UpdateImage;

async function DeleteImage(id){
    const success = await UserSchema.findOne(
        {_id : mongoose.Types.ObjectId(id)} 
    )
    .then(async(user)=>{
        const test = (user.User_Image != "")
        console.log(test)
        if(test)
        {
            console.log("looking")
            let image_name = user.User_Image

            return await UploadFiles.DeleteImage(image_name, user._id)
            .then(async()=>{
                console.log("deleted image")
                await UserSchema.findOneAndUpdate(
                    {_id : mongoose.Types.ObjectId(id)} ,
                    {User_Image : undefined}
                )
                return true
            })
            .catch((err)=>{
                console.log(err)
                return false
            })
        }
        else
        {
            return false
        }
    })
    .catch(err=>{
        // logs message
        console.log(`error while deleting user image from a user \n err : ${err}`)
        return false
    })
    
    console.log("success : ",success)
    return success;
}
module.exports.DeleteImage = DeleteImage;

async function UpdateCover(id,Cover_Image){

    let name;
    const success = await UserSchema.findOneAndUpdate(
        {_id : mongoose.Types.ObjectId(id)},
        {
            Cover_Image
        },
        (err,user)=>
        {
            if(user)
            {
                name = user.User_ID;
            }
        }
    )
    .then(async(user)=>{
        if(user)
        {
            name = user.User_ID;
            console.log(`user : ${name}, has updated their cover`)
            return true
        }
        else
        {
            console.log(`erorr while delting user is ${undefined}`)
            return false
        }
    })
    .catch(err=>{
        console.log(`error while updating user cover from user  : ${name}\nerr : ${err}`)
        return false
    })


    return success;
}
module.exports.UpdateCover=UpdateCover;

async function DeleteCover(id){
    const success = await UserSchema.findOne(
        {_id : mongoose.Types.ObjectId(id)} 
    )
    .then(async(user)=>{
        const test = (user.Cover_Image != "")
        console.log(test)
        if(test)
        {
            let image_name = user.Cover_Image

            return await UploadFiles.DeleteImage(image_name, user._id)
            .then(async()=>{
                console.log("deleted cover")
                await UserSchema.findOneAndUpdate(
                    {_id : mongoose.Types.ObjectId(id)} ,
                    {Cover_Image : undefined}
                )
                return true
            })
            .catch((err)=>{
                console.log(err)
                return false
            })
        }
        else
        {
            return false
        }
    })
    .catch(err=>{
        // logs message
        console.log(`error while deleting user cover from a user \n err : ${err}`)
        return false
    })
    
    console.log("success : ",success)
    return success;
}
module.exports.DeleteCover=DeleteCover;

async function AddSkill(id,skill_name,skill_description,skill_level,skill_image,target_id){
    const skill = {
        _id : mongoose.Types.ObjectId(id),
        skill_name,
        skill_description,
        skill_level,
        skill_image
    }

    const success  = await UserSchema.findOneAndUpdate(
        {_id : mongoose.Types.ObjectId(target_id)},
        {
            $addToSet: {Skills : id}
        }
    )
    .then(async(user)=>{
        // log message
        if(user){
            return await new SkillSchema(skill).save()
            .then(Skill => {
                console.log("user has been created "+Skill)
                console.log(`user :  ${user.User_ID}, has added a new skill `)
                return true;
            })
            .catch(err => {
                console.log("something went wrong while saving skill")
                console.log(err)
                // return success;
                return false;
            });
        }
        else
        {
            console.log("user was not found")
            return false;
        }
    })
    .catch((err)=>{
        // log message
        console.log(`error while adding skill to user  \nerr : `)
        console.log(err)
        return false;
    })

    console.log(success)
    return success;
}
module.exports.AddSkill=AddSkill;


async function DeleteSkill(id,skill_id){
    const success = await UserSchema.findOne(
        {_id : mongoose.Types.ObjectId(id)}
        )
        .then(async(user)=>{
            if(user)
            {
                return await SkillSchema.findOne({_id : mongoose.Types.ObjectId(skill_id)})
                    .then(async(skill)=>{
                        if(skill)
                        {
                            console.log(skill)
                            console.log(skill.skill_image)
                            if(skill.skill_image)
                            {
                                console.log("skill have image")
                                let image_name = skill.skill_image

                                return await UploadFiles.DeleteImage(image_name, skill._id)
                                .then(async()=>{
                                    console.log("deleted skill image")
                                    return await UserSchema.findOneAndUpdate(
                                        {_id : mongoose.Types.ObjectId(id)},
                                        {$pull : {Skills : mongoose.Types.ObjectId(skill_id) } }
                                        )
                                        .then(async()=>{
                                            return await SkillSchema.deleteOne({_id : mongoose.Types.ObjectId(skill_id)})
                                            .then(()=>{
                                                console.log("skill deleted")
                                                return true
                                            })
                                            .catch(()=>{
                                                console.log("something went wrong wile deleting skill")
                                                return false    
                                            })
                                            
                                            
                                        })
                                        .catch(()=>{
                                            console.log("something went wrong while removing skill form user")
                                            return true
                                        })
                                    
                                })
                                .catch((err)=>{
                                    console.log(err)
                                    return false
                                })

                            }
                            else
                            {
                                console.log("skill have no image")
                                return await UserSchema.findOneAndUpdate(
                                    {_id : mongoose.Types.ObjectId(id)},
                                    {$pull : {Skills : mongoose.Types.ObjectId(skill_id) } }
                                    )
                                    .then(async()=>{
                                        return await SkillSchema.deleteOne({_id : mongoose.Types.ObjectId(skill_id)})
                                        .then(()=>{
                                            console.log("skill deleted")
                                            return true
                                        })
                                        .catch(()=>{
                                            console.log("something went wrong wile deleting skill")
                                            return false    
                                        })
                                        
                                        
                                    })
                                    .catch(()=>{
                                        console.log("something went wrong while removing skill form user")
                                        return true
                                    })
                            }

                        }
                        else
                        {
                            console.log("skill not found")
                            return false
                        }
                    })
                    .catch((err)=>{
                        console.log("something whent wrong while looking for skil")
                        return false
                    })
            }
            else
            {
                console.log("couldnt find user")
                return false
            }
        })
        .catch((err)=>{
            console.log(`error while deleting skill from user\nerr : ${err}`)
        return false;
        })
        

    return success;
}
module.exports.DeleteSkill = DeleteSkill;

async function AddContact(id,Contact_method,Contact_link,Contact_icon,target_id)
{
    let name;
    const Contact = {
        _id : mongoose.Types.ObjectId(id),
        Contact_method,
        Contact_link,
        Contact_icon
    }

    const success  = await UserSchema.findOneAndUpdate(
        {_id : mongoose.Types.ObjectId(target_id)},
        {
            $addToSet: {Contacts : id}
        },
        async(error,User)=>
        {
            if(error){
                console.log("user was not found")
                console.log(error)
                return false
            }
            if(User){
                name = User.User_ID;
                await new ContactSchema(Contact).save()
                .then(contact => {
                    console.log("user has been created "+contact)
                    return true;
                })
                .catch(err => {
                    console.log("something went wrong while saving contact")
                    console.log(err)
                    return false;
                });
            }
            else
            {
                console.log("user was not found")
                return false;
            }
        }
    )
    .then((user)=>{
        return true;
    })
    .catch((err)=>{
        console.log(`error while Adding Contact to user  : ${name}\nerr : ${err}`);
        return false;
    })
    return success;
}
module.exports.AddContact=AddContact;


async function DeleteContact(id,contact_id){

    const success = await UserSchema.findOne(
        {_id : mongoose.Types.ObjectId(id)}
        )
        .then(async(user)=>{
            if(user)
            {
                return await ContactSchema.findOne({_id : mongoose.Types.ObjectId(contact_id)})
                    .then(async(contact)=>{
                        if(contact)
                        {
                            if(contact.Contact_icon)
                            {
                                console.log("contact have image")
                                let image_name = contact.Contact_icon

                                return await UploadFiles.DeleteImage(image_name, contact._id)
                                .then(async()=>{
                                    console.log("deleted contact image")
                                    return await UserSchema.findOneAndUpdate(
                                        {_id : mongoose.Types.ObjectId(id)},
                                        {$pull : {Contacts : mongoose.Types.ObjectId(contact_id) } }
                                        )
                                        .then(async()=>{
                                            console.log("contact removed fomr user")
                                            return await SkillSchema.deleteOne({_id : mongoose.Types.ObjectId(contact_id)})
                                            .then(()=>{
                                                console.log("contact deleted")
                                                return true
                                            })
                                            .catch(()=>{
                                                console.log("something went wrong wile deleting contact")
                                                return false    
                                            })
                                            
                                            
                                        })
                                        .catch(()=>{
                                            console.log("something went wrong while removing contact form user")
                                            return true
                                        })
                                })
                                .catch((err)=>{
                                    console.log(err)
                                    return false
                                })

                            }
                            else
                            {
                                console.log("contact have no image")
                                return await UserSchema.findOneAndUpdate(
                                    {_id : mongoose.Types.ObjectId(id)},
                                    {$pull : {Contacts : mongoose.Types.ObjectId(contact_id) } }
                                    )
                                    .then(async()=>{
                                        console.log("contact removed fomr user")
                                        return await SkillSchema.deleteOne({_id : mongoose.Types.ObjectId(contact_id)})
                                        .then(()=>{
                                            console.log("contact deleted")
                                            return true
                                        })
                                        .catch(()=>{
                                            console.log("something went wrong wile deleting contact")
                                            return false    
                                        })
                                        
                                        
                                    })
                                    .catch(()=>{
                                        console.log("something went wrong while removing contact form user")
                                        return true
                                    })
                            }

                        }
                        else
                        {
                            console.log("contact not found")
                            return false
                        }
                    })
                    .catch((err)=>{
                        console.log("something whent wrong while looking for contact")
                        return false
                    })
            }
            else
            {
                console.log("couldn't find user")
                return false
            }
        })
        .catch((err)=>{
            console.log(`error while deleting contact from user\nerr : ${err}`)
        return false;
        })
    return success;
}
module.exports.DeleteContact = DeleteContact;

async function AddGroupToUser(id,UserGroup)
{

    const success = await UserSchema.findOneAndUpdate(
        {_id:mongoose.Types.ObjectId(id)},
        {$addToSet : {User_Groups : UserGroup}}
    )
    .then((doc)=>{
        // console.log(`Added role ${UserGroup} to user : ${doc.User_ID}`)
        return true
    })
    .catch(async(err)=>{
        if(err)
        {
            console.log(err)
            console.log(`failed ot add role ${UserGroup} to user : ${id}`)
            return false
        }
    })
    return success;
}
module.exports.AddGroupToUser = AddGroupToUser;

async function RemoveUserFromUserGroup(id,UserGroup)
{

    const success = await UserSchema.findOneAndUpdate(
        {_id:mongoose.Types.ObjectId(id)},
        {$pull : {User_Groups : UserGroup}}
    )
    .then((doc)=>{
        console.log(`Removed role ${UserGroup} from user : `)
        return true
    })
    .catch(async(err)=>{
        if(err)
        {
            console.log(err)
            console.log(`failed to remove role ${UserGroup} to user : ${id}`)
            return false
        }
    })
    return success;
}
module.exports.RemoveUserFromUserGroup = RemoveUserFromUserGroup;

async function DeleteUserByUserID(User_ID)
{
    await GetUserByUserID(User_ID)
    .then(async(user)=>{
        console.log(user)
        console.log(user.User_Groups)
        await  DeleteImage(user.id)
        await  DeleteCover(user.id)
        if(user.Skills)
        {
            for (const skill of user.Skills)
            {
                console.log(skill)
                await DeleteSkill(user.id,skill)
            }
        }
        if(user.Contacts)
        {
            for (const contact of user.Contacts)
            {
                console.log(contact)
                await DeleteContact(user.id,contact)
            }
        }
        if(user.User_Groups)
        {
            for (const group of user.User_Groups)
            {
                console.log(group)
                await UserGroups.RemoveGroupMember(group,user.id)
            }
        }
        await UserSchema.deleteOne({User_ID : user.User_ID})
        .then(()=>{
            console.log("User has been deleted")
            return true
        })
        .catch(()=>{
            console.log("failed to delete a user")
            return false
        })
    })
    .catch((err)=>{
        console.log(err)
        
    })
}
module.exports.DeleteUserByUserID = DeleteUserByUserID;

