const mongo = require('../mongoose/mongo');
const mongoose = require("mongoose")

const UploadSchema = require('../mongoose/schemas/Upload-Schema');
const CommentSchema = require('../mongoose/schemas/Comment-Schema');
const Permissions = require('./Permissions')

const register = require("./Users");

const UploadFiles= require("./File_Uploads");


async function CreateUpload(id,User,Type,Content,Level,Date)
{
    let Upload_user
    if( User == undefined)
    {
        Upload_user =  undefined
    }
    else
    {
        Upload_user = User._id
    }
    const upload ={
        _id :   id,
        User : Upload_user,
        Type,
        Level,
        Content : Content,
        Upload_Date : Date,
        Modified_Date : Date,
    }

    const success = await new UploadSchema(upload).save()
    .then((doc)=>{
        if(!doc)
        {
            console.log("Upload does not exist")

            return false;
        }

        console.log("Upload saved successfully")
        return true
    })
    .catch(async(err)=>{
        if(err)
        {
            console.log(err)
            console.log("something went wrong while saving the upload")
            return false
        }
    })

    // console.log("success",success)
    // const DB = await UploadSchema.find({});
    // console.log(DB);

    return success;
}
module.exports.CreateUpload = CreateUpload;

async function Update_Upload(Traget_id,Content,Date)
{
    // Content : Content,
    // Upload_Date : Date,
    const success = await UploadSchema.findOneAndUpdate
    (
        {_id : mongoose.Types.ObjectId(Traget_id)},
        {$set:{"Content" : Content,"Upload_Date" : Date}}
    )
    .then((doc)=>{
        if(!doc)
        {
            console.log("Upload does not exist")

            return false;
        }

        console.log("Upload Updated successfully")
        return true
    })
    .catch(async(err)=>{
        if(err)
        {
            console.log("something went wrong while updating the sub_upload")
            return false
        }
    })

    // console.log("success",success)
    // const DB = await UploadSchema.find({});
    // console.log(DB);
    return success;
}
module.exports.Update_Upload = Update_Upload;

async function DeleteUploadById(id)
{
    const success = await UploadSchema.findOneAndDelete(
        {_id :mongoose.Types.ObjectId(id)}
    )
    .then(async(doc)=>
    {
        if(!doc)
        {
            console.log("Upload does not exist")

            return false;
        }

        let files = [...doc.Content.images];
        if(files)
        {
            files.forEach(async(file)=>
            {
                await UploadFiles.DeleteImage(file,doc._id)
            })
        }
        if(doc.Comments)
        {
            await doc.Comments.forEach(async(Comment)=>{
                await DeleteComment(Comment._id)
            })
        }
        if(doc.Sub_Upload)
        {
            await doc.Sub_Upload.forEach(async(Sub)=>{
                await DeleteUploadById(Sub._id)
            })
        }

        return true;
    })
    .catch((err)=>{
        console.log(err)
        return false;
    })
    // console.log("success",success)
    return success;
}
module.exports.DeleteUploadById = DeleteUploadById;


async function CreateComment(id,User,Type,Content,Date,Level,Traget_id)
{
    let Upload_user
    if( User !== undefined)
    {
        Upload_user = User._id
    }

    if(!Traget_id)
    {
        return false
    }
    const Comment ={
        _id :   id,
        User : Upload_user,
        Type : Type,
        Content : Content,
        Upload_Date : Date,
        Level ,
        Modified_Date : Date,
    }

    const success =  await new CommentSchema(Comment).save()
    .then(async(log)=>{
        if(!log)
        {
            console.log("something went wrong while saving the comment")
            return false
        }
        return await UploadSchema.findOneAndUpdate
        (
            {_id : mongoose.Types.ObjectId(Traget_id)},
            {$addToSet:{"Comments" : mongoose.Types.ObjectId(id)}},
            {}
        )
        .then((doc)=>{
            if(!doc)
            {
                console.log("Comment does not exist")
                return false
            }
            console.log("Comment added to upload successfully")
            return true
        })
        .catch(async(err)=>{
            if(err)
            {
                console.log("something went wrong while adding comment to upload")
                return false
            }
        })
    })
    .catch(async(err)=>{
        console.log(err);
        console.log("something went wrong while making the comment");
        return false;
    })
    // console.log("success",success)
    return success;
    
}
module.exports.CreateComment = CreateComment;

async function UpdateComment(Content,Date,Traget_id)
{

    if(!Traget_id)
    {
        return false
    }
    const success = await CommentSchema.findOneAndUpdate
    (
        {_id : mongoose.Types.ObjectId(Traget_id)},
        {$set:{"Content" : Content,"Modified_Date" : Date}},
        {}
    )
    .then((doc)=>{
        if(!doc)
        {
            console.log("Comment does not exist")

            return false;
        }

        console.log("Comment Updated successfully")
        return true
    })
    .catch(async(err)=>{
        if(err)
        {
            console.log("something went wrong while updating the Comment")
            return false
        }
    })
    // const DB = await UploadSchema.find({});
    // console.log(DB);
    
    // console.log("success",success)
    return success;
}
module.exports.UpdateComment = UpdateComment;


async function DeleteComment(id){
    

    const success = await CommentSchema.findOneAndDelete({_id : mongoose.Types.ObjectId(id)})
    .then(async(doc)=>{
        if(!doc)
        {
            console.log("Comment not found in Collection")
            return false;
        }
        if(doc.Content.images.length)
        {
            const test =  await [...doc.Content.images].forEach(async(image)=>{
                return await UploadFiles.UploadGFS.find({ filename : image , metadata : mongoose.Types.ObjectId(id)}).toArray(async (error,img)=>
                {
                    if(error) 
                    {
                        console.log (error);
                        console.log ("error while looking for file ");
                        return false
                    }
                    if(!img.length)
                    {
                        console.log("file was not found")
                        return false
                    } 

                    return await UploadFiles.UploadGFS.delete(mongoose.Types.ObjectId(img[0]._id))
                    .then((img)=>{
                        console.log("Image deleted")
                        return true
                    })
                    .catch((error)=>{
                        console.log(err)
                        console.log("Error while deleting file")
                        return false
                    })
                })
            })
            console.log(`test : ${test}`)
            return test;
        }
    })
    .catch(async(err)=>{
        console.log(err)
        console.log("error while removing comment form collection")
        return false;
    })
    // console.log("success",success);
    return success;
}
module.exports.DeleteComment = DeleteComment;

async function DeleteUploadComment(id){
    
    return await UploadSchema.findOneAndUpdate(
        {"Comments": mongoose.Types.ObjectId(id)},
        {$pull:{"Comments" : id}}
    )
    .then(async (doc)=>{
        if(!doc)
        {
            console.log("Comment not found in collection")
            return false;
        }

        console.log("comment removed from post")
        await CommentSchema.findOneAndDelete({_id : mongoose.Types.ObjectId(id)})
        .then(async (doc)=>{
            if(!doc)
            {
                console.log("Comment not found in Collection")
                return false;
            }
            if(doc.Content.images.length)
            {
                return await [...doc.Content.images].forEach(async(image)=>{
                    await UploadFiles.UploadGFS.find({ filename : image , metadata : mongoose.Types.ObjectId(id)}).toArray(async (error,img)=>
                    {
                        if(error) 
                        {
                            console.log (error);
                            console.log ("error while looking for file ");
                            return false
                        }
                        if(!img.length)
                        {
                            console.log("file was not found")
                            return false
                        } 

                        return await UploadFiles.UploadGFS.delete(mongoose.Types.ObjectId(img[0]._id))
                        .then(()=>{
                            console.log("comment deleted from collection")
                            return true
                        })
                        .catch((err)=>{
                            console.log(err)
                            console.log("Error while deleting file")
                            return false
                        });
                    });
                })
            }
        })
        .catch((error)=>{
            console.log(error)
            console.log("error while removing comment form collection")
            return false;
        })
    })
    .catch((err)=>{
        console.log(err)
        console.log("error while removing comment form upload")
        return false;
    })
}
module.exports.DeleteUploadComment = DeleteUploadComment;

async function CreateSub_Upload(id,User,Type,Content,Date,Level,Traget_id)
{
    let Upload_user =User;
    if( User == undefined)
    {
        console.log("user is undefined")
        Upload_user = undefined

        return false

    }
    else
    {
        Upload_user = User._id
    }
    
    if(!Traget_id)
    {
        console.log("Target id is undefined")
        return false
    }

    const Upload ={
        _id :   id,
        User : Upload_user,
        Type : Type,
        Content : Content,
        Upload_Date : Date,
        Modified_Date : Date,
        Level,
        Parent_Upload : mongoose.Types.ObjectId(Traget_id),
    }

    const success =  await new UploadSchema(Upload).save()
    .catch(async(err)=>{
        if(err)
        {
            console.log(err)
            console.log("something went wrong while saving the sub_upload")
            
            return false
        }
    }).then(async (doc)=>{

        return await UploadSchema.findOneAndUpdate(
            {_id : mongoose.Types.ObjectId(Traget_id)},
            {$addToSet:{"Sub_Upload" : mongoose.Types.ObjectId(id)},
             $set:{Modified_Date : Date},
            })
            .then((doc)=>{
                // console.log(doc)
                if(!doc)
                {
                    console.log("Document does not exist")
                    return false
                }
                else
                {
                    return true
                }
            
            })
            .catch((err)=>{
                console.log(err)
                console.log("Error while updating a Sub_Upload")
                return false
            })
    })
    // console.log(success)
    return success;
}
module.exports.CreateSub_Upload = CreateSub_Upload;


async function DeleteSub_Upload(id){
    
    return await UploadSchema.findOneAndUpdate(
        {"Sub_Upload": mongoose.Types.ObjectId(id)},
        {$pull : {"Sub_Upload" : mongoose.Types.ObjectId(id)}}
    )
    .then(async (doc)=>{
        if(!doc)
        {
            console.log("Sub_Upload not found in Collection")
            return false;
        }
        if(doc.Content.images.length)
        {
            return await [...doc.Content.images].forEach(async(image)=>{
                await UploadFiles.UploadGFS.find({ filename : image , metadata : mongoose.Types.ObjectId(id)}).toArray(async (error,img)=>
                {
                    if(error) 
                    {
                        console.log ("error while looking for file ");
                        console.log (error);
                        return false
                    }
                    if( !img.length)
                    {
                        console.log("file was not found")
                        return false
                    } 
                    return await UploadFiles.UploadGFS.delete(mongoose.Types.ObjectId(img[0]._id))
                    .then(()=>{
                        
                        return true
                    })
                    .catch((err)=>{
                        console.log(err)
                        console.log("Error while deleting file")
                        return false
                    });
                });
            })
        }
        console.log("Sub_Upload deleted from collection")
    })
    .catch((err)=>{
        console.log(err)
        console.log("error while removing Sub_Upload form upload")
        return false;
    })
}
module.exports.DeleteSub_Upload = DeleteSub_Upload;



async function GetAllUploads()
{
    const Uploads = await UploadSchema.find({},{},{});
    return Uploads
}
module.exports.GetAllUploads = GetAllUploads;

async function GetAllUploadsDescending(resources)
{
    const Uploads = await UploadSchema.find()
    .populate("User")
    .populate({
            path: 'Comments',
            options: { sort: ['-Upload_Date'] },
            populate : {path : "User" }
    })
    .populate({
        path: 'Sub_Upload',
        populate : {
            path : "Comments",
            options: { sort: ['-Upload_Date'] },
            populate:{
                path:"User"
            }
        }
    })
    .populate({
        path: 'Sub_Upload',
        populate : {
            path : "User",
        }
    })
    .populate({
        path: 'Parent_Upload', 
        populate : {
            path : "User" 
        }
    })
    // .populate({
    //     path: 'Parent_Upload', 
    //     populate : {
    //         path : "Comments",
    //         options: { sort: ['-Upload_Date'] }
    //     }
    // })

    return Uploads
}
module.exports.GetAllUploadsDescending = GetAllUploadsDescending;

async function GetAllUploadsDescendingOfType(type)
{
    const Uploads = await UploadSchema.find({Type : type,"Parent_Upload":{$exists : false}})
    .sort({Upload_Date: -1})
    .populate("User")
    .populate({
        path: 'Comments',
        options: { sort: ['-Upload_Date'] },
        populate : {path : "User" }
    })
    .populate({
        path: 'Sub_Upload',
        populate : {
            path : "Comments",
            options: { sort: ['-Upload_Date'] },
            populate:{
                path:"User"
            }
        }
    })
    .populate({
        path: 'Sub_Upload',
        populate : {
            path : "User",
        }
    })
    .populate({
        path: 'Parent_Upload', 
        populate : {
            path : "User" 
        }
    })
    return Uploads
}
module.exports.GetAllUploadsDescendingOfType = GetAllUploadsDescendingOfType;

async function GetUploadById(upload_id)
{
    const Upload = await UploadSchema.findOne({_id : mongoose.Types.ObjectId(upload_id)},(err,upload)=>{
        if (err)
        {
            console.log(err)
            return false
        }
        if(upload)
        {
            return upload
        }
    })
    .populate("User")
    .populate({
        path: 'Comments',
        options: { sort: ['-Upload_Date'] },
        populate : {path : "User" }
    })
    .populate({
        path: 'Sub_Upload',
        options: { sort: ['-Upload_Date'] },
        populate : {
            path : "Comments",
            populate:{
                path:"User"
            }
        }
    })
    .populate({
        path: 'Sub_Upload',
        options: { sort: ['-Upload_Date'] },
        populate : {
            path : "User",
        }
    })
    .populate({
        path: 'Parent_Upload', 
        populate : {
            path : "User" 
        }
    })
    .then((uploads)=>{
        return uploads
    })
    .catch((err)=>{
        console.log(err)
        return undefined
    })
    return Upload
}
module.exports.GetUploadById = GetUploadById;

async function GetCommentById(comment_id)
{
    const Comment = await CommentSchema.findOne({_id : mongoose.Types.ObjectId(comment_id)},(err,doc)=>{
        if (err)
        {
            console.log(err)
            return false
        }
        if(!doc)
        {
            console.log("Comment does not exist")

            return false;
        }

        if(doc)
        {
            return doc
        }
    })
    .populate("User")
    .then((uploads)=>{
        return uploads
    })
    .catch((err)=>{
        console.log(err)
        return undefined
    })

    return Comment
}
module.exports.GetCommentById = GetCommentById;


async function GetUploadsLastUpdated()
{
    const Uploads = await UploadSchema.find()
    .sort({Upload_Date: -1})
    .populate("User")
    .populate({
            path: 'Comments',
            options: { sort: ['-Upload_Date'] },
            populate : {path : "User" }
    })
    .populate({
        path: 'Sub_Upload',
        populate : {
            path : "Comments",
            options: { sort: ['-Upload_Date'] },
            populate:{
                path:"User"
            }
        }
    })
    .populate({
        path: 'Sub_Upload',
        populate : {
            path : "User",
        }
    })
    .populate({
        path: 'Parent_Upload', 
        populate : {
            path : "User" 
        }
    })
    .then((uploads)=>{
        return uploads
    })
    .catch((err)=>{
        console.log(err)
        return undefined
    })
    // .populate({
    //     path: 'Parent_Upload', 
    //     populate : {
    //         path : "Comments",
    //         options: { sort: ['-Upload_Date'] }
    //     }
    // })

    return Uploads
}
module.exports.GetUploadsLastUpdated = GetUploadsLastUpdated;

async function GetUploadsLastUpdatedOfType(type)
{
    const Uploads = await UploadSchema.find({Type : type})
    .sort({Upload_Date: -1})
    .populate("User")
    .populate({
            path: 'Comments',
            options: { sort: ['-Upload_Date'] },
            populate : {path : "User" }
    })
    .populate({
        path: 'Sub_Upload',
        populate : {
            path : "Comments",
            options: { sort: ['-Upload_Date'] },
            populate:{
                path:"User"
            }
        }
    })
    .populate({
        path: 'Sub_Upload',
        populate : {
            path : "User",
        }
    })
    .populate({
        path: 'Parent_Upload', 
        populate : {
            path : "User" 
        }
    })
    .then((uploads)=>{
        return uploads
    })
    .catch((err)=>{
        console.log(err)
        return undefined
    })
    // .populate({
    //     path: 'Parent_Upload', 
    //     populate : {
    //         path : "Comments",
    //         options: { sort: ['-Upload_Date'] }
    //     }
    // })

    return Uploads
}
module.exports.GetUploadsLastUpdatedOfType = GetUploadsLastUpdatedOfType;

async function GetAnonUploadsLastUpdatedOfType(type) 
{
    const Uploads = await UploadSchema.find({User : undefined,Type : type})
    .sort({Upload_Date: -1})
    .populate("User")
    .populate({
            path: 'Comments',
            options: { sort: ['-Upload_Date'] },
            populate : {path : "User" }
    })
    .populate({
        path: 'Sub_Upload',
        populate : {
            path : "Comments",
            options: { sort: ['-Upload_Date'] },
            populate:{
                path:"User"
            }
        }
    })
    .populate({
        path: 'Sub_Upload',
        populate : {
            path : "User",
        }
    })
    .populate({
        path: 'Parent_Upload', 
        populate : {
            path : "User" 
        }
    })
    .then((uploads)=>{
        return uploads
    })
    .catch((err)=>{
        console.log(err)
        return undefined
    })
    // .populate({
    //     path: 'Parent_Upload', 
    //     populate : {
    //         path : "Comments",
    //         options: { sort: ['-Upload_Date'] }
    //     }
    // })

    return Uploads
}
module.exports.GetAnonUploadsLastUpdatedOfType = GetAnonUploadsLastUpdatedOfType;

async function GetAnonUploadsLastUpdated()
{
    const Uploads = await UploadSchema.find({User : undefined})
    .sort({Upload_Date: -1})
    .populate("User")
    .populate({
            path: 'Comments',
            options: { sort: ['-Upload_Date'] },
            populate : {path : "User" }
    })
    .populate({
        path: 'Sub_Upload',
        populate : {
            path : "Comments",
            options: { sort: ['-Upload_Date'] },
            populate:{
                path:"User"
            }
        }
    })
    .populate({
        path: 'Sub_Upload',
        populate : {
            path : "User",
        }
    })
    .populate({
        path: 'Parent_Upload', 
        populate : {
            path : "User" 
        }
    })
    .then((uploads)=>{
        return uploads
    })
    .catch((err)=>{
        console.log(err)
        return undefined
    })
    // .populate({
    //     path: 'Parent_Upload', 
    //     populate : {
    //         path : "Comments",
    //         options: { sort: ['-Upload_Date'] }
    //     }
    // })

    return Uploads
}
module.exports.GetAnonUploadsLastUpdated = GetAnonUploadsLastUpdated;

async function GetAnonUploadsLastUpdatedResourceFiltered(resources=[])
{
    if(resources.length == 0)
    {
        return undefined
    }
    const Uploads = await UploadSchema.find({User : undefined,Type : { $in : resources } })
    .sort({Upload_Date: -1})
    .populate("User")
    .populate({
            path: 'Comments',
            options: { sort: ['-Upload_Date'] },
            populate : {path : "User" }
    })
    .populate({
        path: 'Sub_Upload',
        populate : {
            path : "Comments",
            options: { sort: ['-Upload_Date'] },
            populate:{
                path:"User"
            }
        }
    })
    .populate({
        path: 'Sub_Upload',
        populate : {
            path : "User",
        }
    })
    .populate({
        path: 'Parent_Upload', 
        populate : {
            path : "User" 
        }
    })
    .then((uploads)=>{
        return uploads
    })
    .catch((err)=>{
        console.log(err)
        return undefined
    })
    // .populate({
    //     path: 'Parent_Upload', 
    //     populate : {
    //         path : "Comments",
    //         options: { sort: ['-Upload_Date'] }
    //     }
    // })

    return Uploads
}
module.exports.GetAnonUploadsLastUpdatedResourceFiltered = GetAnonUploadsLastUpdatedResourceFiltered;

async function GetUploadsLastUpdatedResourceFiltered(resources=[])
{
    if(resources.length == 0)
    {
        return undefined
    }
    else
    {

        const Uploads = await UploadSchema.find({Type : { $in : resources } })
        .sort({Upload_Date: -1})
        .populate("User")
        .populate({
                path: 'Comments',
                options: { sort: ['-Upload_Date'] },
                populate : {path : "User" }
        })
        .populate({
            path: 'Sub_Upload',
            populate : {
                path : "Comments",
                options: { sort: ['-Upload_Date'] },
                populate:{
                    path:"User"
                }
            }
        })
        .populate({
            path: 'Sub_Upload',
            populate : {
                path : "User",
            }
        })
        .populate({
            path: 'Parent_Upload', 
            populate : {
                path : "User" 
            }
        })
        .then((uploads)=>{
            return uploads
        })
        .catch((err)=>{
            console.log(err)
            return undefined
        })
        // .populate({
        //     path: 'Parent_Upload', 
        //     populate : {
        //         path : "Comments",
        //         options: { sort: ['-Upload_Date'] }
        //     }
        // })
    
        return Uploads
    }
}
module.exports.GetUploadsLastUpdatedResourceFiltered = GetUploadsLastUpdatedResourceFiltered;


async function GetUserUploadsLastUpdatedResourceFiltered(user_id,resources)
{
    const Uploads = await UploadSchema.find({User : mongoose.Types.ObjectId( user_id) ,Type : { $in : resources } })
    .sort({Upload_Date: -1})
    .populate("User")
    .populate({
            path: 'Comments',
            options: { sort: ['-Upload_Date'] },
            populate : {path : "User" }
    })
    .populate({
        path: 'Sub_Upload',
        populate : {
            path : "Comments",
            options: { sort: ['-Upload_Date'] },
            populate:{
                path:"User"
            }
        }
    })
    .populate({
        path: 'Sub_Upload',
        populate : {
            path : "User",
        }
    })
    .populate({
        path: 'Parent_Upload', 
        populate : {
            path : "User" 
        }
    })
    .then((uploads)=>{
        return uploads
    })
    .catch((err)=>{
        console.log(err)
        return undefined
    })
    // .populate({
    //     path: 'Parent_Upload', 
    //     populate : {
    //         path : "Comments",
    //         options: { sort: ['-Upload_Date'] }
    //     }
    // })

    return Uploads
}
module.exports.GetUserUploadsLastUpdatedResourceFiltered = GetUserUploadsLastUpdatedResourceFiltered;