const express = require("express");
const router = express.Router();

const mongo = require("mongodb");

const TEXT = require("../Text");

const mongoose = require("mongoose")
const multer = require('multer')

const {GridFsStorage} = require("multer-gridfs-storage")
const GridFsStream = require ("gridfs-stream")
const mongoPath = process.env.SimpleWSMongoURI;


const UploadFileConn = mongoose.createConnection(mongoPath,{
    useNewUrlParser: true,
    useUnifiedTopology : true,
    useCreateIndex : true,
    useFindAndModify : false,
});

let UploadGFS;

UploadFileConn.once("open", ()=> {
    UploadGFS =  new mongoose.mongo.GridFSBucket(UploadFileConn.db,{
        bucketName : "UploadFiles"
    })
    module.exports.UploadGFS = UploadGFS;

})




const UploadFileStorage = new GridFsStorage({
    url: mongoPath,
    options: {
        useUnifiedTopology: true,
        useNewUrlParser: true,
    },
    file: (req, file) => {
        
        return new Promise((resolve, reject) => {
        if(mongo.ObjectID.isValid(req.body.id))
        {
            const filename =`${Date.now().toString().substring(Date.now().toString().length-4)}${TEXT.LowDashAll(file.originalname)}`;
            const fileInfo = {
                filename: filename,
                bucketName: 'UploadFiles',
                metadata : mongoose.Types.ObjectId(req.body.id),
            };
            resolve(fileInfo);
        }
        else if (req.baseUrl == "/settings"){
            const filename =`${Date.now().toString().substring(Date.now().toString().length-4)}${TEXT.LowDashAll(file.originalname)}`;
            const fileInfo = {
                filename: filename,
                bucketName: 'UploadFiles',
                metadata : "defualtImage",
            };
            resolve(fileInfo);
        }
        else
        {
            reject("In valid id used to save document")
        }
      });
    }
  });
const UploadFileUpload = multer({ storage : UploadFileStorage });


const UploadMiddleware = (req,res,next) =>{
    const Upload = UploadFileUpload.fields([
        { name: 'image', maxCount: 1 },
        { name: 'images', maxCount: 12 },
    ])
    Upload(req,res,function(err){
        if(err)
        {
            return res.status(400).send(err);
        }
        next();
    })
}
module.exports.UploadMiddleware = UploadMiddleware;


async function DeleteImage(filename, metadata)
{
    if(await mongoose.Types.ObjectId.isValid(metadata))
    {
        return await UploadGFS.find({ filename : filename , metadata : mongoose.Types.ObjectId(metadata)}).toArray(async (error,img)=>
        {
            if(error) 
            {
                console.log ("error while looking for file ");
                console.log (error);
                return false
            }
            if(!img.length)
            {
                console.log("file was not found")
                return false
            } 

            return await UploadGFS.delete(mongoose.Types.ObjectId(img[0]._id),(err)=>{
                if(err)
                {
                    console.log("Error while deleting file")
                    console.log(err)
                    return false
                }
                return true
            });
        });
    }
    else
    {
        return await UploadGFS.find({ filename : filename , metadata : metadata}).toArray(async (error,img)=>
        {
            if(error) 
            {
                console.log ("error while looking for file ");
                console.log (error);
                return false
            }
            if(!img.length)
            {
                console.log("file was not found")
                return false
            } 

            return await UploadGFS.delete(mongoose.Types.ObjectId(img[0]._id),(err)=>{
                if(err)
                {
                    console.log("Error while deleting file")
                    console.log(err)
                    return false
                }
                return true
            });
        });
    }
    
}

module.exports.DeleteImage = DeleteImage;