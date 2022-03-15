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
const checkSetupUser = require("../authentication/auth").checkSetupUser;

const Settings = require("../CRUD/Settings")

const Requests = require("../Requests/Write")

// const { User } = require("../../config/keys");

router.get("/",async(req,res) => 
{
    res.redirect("/home");
})

router.get("/home",checkSetupUser,getUserPermissions,async (req,res) => 
{
    // console.log(req.user)
    let title="Home"
    const user = await typeof req.user !='undefined' ? await res.locals.User : undefined;
    const userPermissions = res.locals.Permissions;
    const owner = await Users.GetOwner()
    const settings = await Settings.getSettings();

    // console.log(owner)

    let uploads = await upload.GetAllUploadsDescending();
    let nextid =await  mongoose.Types.ObjectId();
    res.render("home",{
        title:title,
        user:user,
        uploads:uploads,
        nextid,
        userPermissions,
        settings,
        owner
    });
})

router.get("/projects",getUserPermissions,async (req,res) => 
{
    let title="Projects"
    let nextid = await mongoose.Types.ObjectId();

    const user = await typeof req.user !='undefined' ? await res.locals.User : undefined;
    const userPermissions = res.locals.Permissions;
    const owner = await Users.GetOwner()

    const settings = await Settings.getSettings();

    let uploads = await upload.GetAllUploadsDescendingOfType("project");

    
    res.render("projects",{
        title:title,
        user:user,
        uploads:uploads,
        nextid,
        userPermissions,
        settings,
        owner
    });
})

router.get("/blogs",getUserPermissions,async (req,res) => 
{
    let title="Blogs"
    let nextid =await  mongoose.Types.ObjectId();

    const user = await typeof req.user !='undefined' ? await res.locals.User : undefined;
    const userPermissions = res.locals.Permissions;
    const owner = await Users.GetOwner()


    const settings = await Settings.getSettings();

    if(userPermissions.Values.hasOwnProperty(`readblogs`))
    {

        let test = "blogs"
        let uploads = await upload.GetAllUploadsDescendingOfType("blog");
    
        res.render("blogs",{
            title:title,
            user:user,
            uploads:uploads,
            nextid,
            userPermissions,
            settings,
            owner
        });
    }
    else
    {
        req.flash("error","")
        res.redirect("/home")
    }

})


router.post("/posts",getUserPermissions,UploadFiles.UploadMiddleware,async(req,res) =>
{
    const user = await typeof req.user !='undefined' ? res.locals.User : undefined;
    const userPermissions =  res.locals.Permissions;

    const settings = await Settings.getSettings();

    Requests.PostRequest(req,res,user,userPermissions,settings)

})

router.post("/blogs",getUserPermissions,UploadFiles.UploadMiddleware ,async(req,res) =>
{
    const user = await typeof req.user !='undefined' ? await res.locals.User : undefined;
    const userPermissions = res.locals.Permissions;

    const settings = await Settings.getSettings();

    Requests.BlogRequest(req,res,user,userPermissions,settings)

})

router.post("/projects",getUserPermissions,UploadFiles.UploadMiddleware,async(req,res) =>
{
    const user = await typeof req.user !='undefined' ? await res.locals.User : undefined;
    const userPermissions = res.locals.Permissions;

    const settings = await Settings.getSettings();

    Requests.ProjectRequest(req,res,user,userPermissions,settings)
})

// comments
router.post("/upload/:upload_id/comment",getUserPermissions,UploadFiles.UploadMiddleware,async(req,res) =>
{
    const user = await typeof req.user !='undefined' ? await res.locals.User : undefined;
    const userPermissions = res.locals.Permissions;

    const settings = await Settings.getSettings();

    Requests.CommentRequest(req,res,user,userPermissions,settings)
    
})

router.post("/upload/:upload_id",getUserPermissions,UploadFiles.UploadMiddleware,async(req,res) =>
{
    const settings = await Settings.getSettings();

    if(mongo.ObjectID.isValid(req.params.upload_id))
    {
        const uploads = await upload.GetUploadById(req.params.upload_id);

        const user = await typeof req.user !='undefined' ? await res.locals.User : undefined;
    
        const userPermissions = res.locals.Permissions;

        if(! settings.options.includes("Personal_Website"))
        {
            if(uploads.Parent_Upload == undefined)
            {

                if(user && uploads.User &&  user._id.toString() == uploads.User._id.toString()){
                    
                    if(uploads.Type == "post")
                    {
                        // errors.push({msg :"Posts can't have Sub Uploads"});
                        req.flash('error',"Posts can't have Sub Uploads");
                    }
                    if(uploads.Type == "blog")
                    {
                        Requests.SupBlogRequest(req,res,user,userPermissions,uploads,settings)
                    }
                    if(uploads.Type == "project")
                    {
                        Requests.SupProjectRequest(req,res,user,userPermissions,uploads,settings)
                    }
                }
                else
                {
                    req.flash('error',`you can't modify this document`)
                }
            }    
            else
            {
                console.log("Sub_Documents cant contain Sub_Documents")
            }
            // res.redirect(`/upload/${req.params.upload_id}`);
        }
        else
        {
            if(user.User_Groups.include("Owner"))
            {
                if(uploads.Parent_Upload == undefined)
                {

                    if(user && uploads.User &&  user._id.toString() == uploads.User._id.toString()){
                        
                        if(uploads.Type == "post")
                        {
                            // errors.push({msg :"Posts can't have Sub Uploads"});
                            req.flash('error',"Posts can't have Sub Uploads");
                        }
                        if(uploads.Type == "blog")
                        {
                            Requests.SupBlogRequest(req,res,user,userPermissions,uploads,settings)
                        }
                        if(uploads.Type == "project")
                        {
                            Requests.SupProjectRequest(req,res,user,userPermissions,uploads,settings)
                        }
                    }
                    else
                    {
                        req.flash('error',`you can't modify this document`)
                    }
                }    
                else
                {
                    console.log("Sub_Documents cant contain Sub_Documents")
                    res.redirect(`/upload/${req.params.upload_id}`);
                }
            }
            else
            {
                req.flash('error',`you can't modify this document`)
            }
        }
        
        
    }
    else
    {
        req.flash("error","In valid upload id")
        res.redirect("/home")
    }
    
   
})

router.get("/upload/:upload_id",getUserPermissions,async(req,res) =>
{

    const user = await typeof req.user !='undefined' ? await res.locals.User : undefined;
    const userPermissions = res.locals.Permissions;
    const settings = await Settings.getSettings();
    const owner = await Users.GetOwner()

    if(mongo.ObjectID.isValid(req.params.upload_id))
    {
        
        const uploads = await upload.GetUploadById(req.params.upload_id);
        if(uploads.User && user && user._id.toString() == uploads.User._id || userPermissions.Values[`read${uploads.Type}s`] )
        {
            let title = uploads.Content.Title != undefined ? uploads.Content.Title : uploads.Content.Text; 
            let nextid = mongoose.Types.ObjectId();
            
            // console.log("parent : ", uploads.Parent_Upload)
            res.render("upload",{title:title,user:user,upload:uploads,nextid,userPermissions,settings,owner});

        }
        else
        {
            req.flash("error","you're not allowed to read this document")
            res.redirect("/home")
        }
        
    }
    else
    {
        req.flash("error","In valid upload id")
        res.redirect("/home")
    }
})

// editing uploads
router.get("/upload/:upload_id/edit",getUserPermissions,UploadFiles.UploadMiddleware,async(req,res) =>
{
    const settings = await Settings.getSettings();

    const user = await typeof req.user !='undefined' ? await res.locals.User : undefined;
    const userPermissions = res.locals.Permissions;


    if(mongo.ObjectID.isValid(req.params.upload_id))
    {
        
        let uploads = await upload.GetUploadById(req.params.upload_id);
        if(uploads.User && user && user._id.toString() == uploads.User._id)
        {
            let title = uploads.Content.Title != undefined ? uploads.Content.Title : uploads.Content.Text; 
            let nextid = mongoose.Types.ObjectId();
        
            res.render("edit",{title:title,user:user,upload:uploads,nextid,settings});
        }
        else
        {
            req.flash("error" , "you're not authorized to edit this document")
            res.redirect("/home")
        }
    }
    else
    {
        req.flash("error","In valid upload id")
        res.redirect("/home")
    }

})

// update any type of upload
router.put("/upload/:upload_id/",getUserPermissions,UploadFiles.UploadMiddleware,async(req,res) =>
{
    const user = await typeof req.user !='undefined' ? await res.locals.User : undefined;
    const userPermissions = res.locals.Permissions;

    const uploads = await upload.GetUploadById(req.params.upload_id)

    const settings = await Settings.getSettings();

    if(settings.options.includes("Personal_Website") )
    {
        if(user.User_Groups.includes("owner"))
        {
            if(uploads.Type == "post")
            {
                await Requests.EditPostRequest(req,res,user,userPermissions,uploads,settings)
            }
            if(uploads.Type == "project")
            {
                await Requests.EditProjectRequest(req,res,user,userPermissions,uploads,settings)
            }
            if(uploads.Type == "blog")
            {
                await Requests.EditBlogRequest(req,res,user,userPermissions,uploads,settings)
            }
        }
        else
        {
            req.flash("error","you're not authorized to edit this document")
            res.redirect("/home")
        }
    }
    else
    {
        if(uploads.User && user && user._id.toString() == uploads.User._id)
        {
            if(uploads.Type == "post")
            {
                Requests.EditPostRequest(req,res,user,userPermissions,uploads,settings)
            }
            if(uploads.Type == "project")
            {
                Requests.EditProjectRequest(req,res,user,userPermissions,uploads,settings)
            }
            if(uploads.Type == "blog")
            {
                Requests.EditBlogRequest(req,res,user,userPermissions,uploads,settings)
            }
        }
        else
        {
            req.flash("error","you're not authorized to edit this document")
            res.redirect("/home")
        }
    }

})

// editing comment 
router.get("/comment/:comment_id/edit",getUserPermissions,UploadFiles.UploadMiddleware,async(req,res) =>
{
    if(mongo.ObjectID.isValid(req.params.comment_id))
    {
        const Comment = await upload.GetCommentById(req.params.comment_id);
        const owner = await Users.GetOwner()

        const user = await typeof req.user !='undefined' ? await res.locals.User : undefined;
        const userPermissions = res.locals.Permissions;

        let title = Comment.Content.Text != undefined ? Comment.Content.Text : ""; 
        let nextid = mongoose.Types.ObjectId();
        let errors=[];

        console.log(req.body);
        if(user && Comment.User &&  user._id.toString() == Comment.User._id.toString())
        {
            res.render("edit",{
                title:title,
                user:user,
                upload:Comment,
                nextid,
                userPermissions,
                owner
            });
        }
        else
        {
            req.flash("error","In valid comment id")
            res.redirect("/home")
        }
    }

})

// update comments
router.put("/comment/:comment_id/",getUserPermissions,UploadFiles.UploadMiddleware,async(req,res) =>
{
    if(mongo.ObjectID.isValid(req.params.comment_id))
    {
        const user = await typeof req.user !='undefined' ? await res.locals.User : undefined;
        const userPermissions = res.locals.Permissions;

        const Comment = await upload.GetCommentById(req.params.comment_id);
        if(user && Comment.User &&  user._id.toString() == Comment.User._id.toString())
        {
            Requests.EditCommentRequest(req,res,user,userPermissions,Comment,settings)
        }
    }
    else
    {
        req.flash("error","In valid upload id")
    }
    res.redirect(`/home`);
})

// getting images 

router.get("/defaultimage/:image_name",getUserPermissions,async(req,res) =>
{
    try{
        await UploadFiles.UploadGFS.find({metadata : "defualtImage" ,filename : req.params.image_name}).toArray((err,file)=>{
            if(!file || file.length === 0 ) return res.status(400).send("no files exists")
            UploadFiles.UploadGFS.openDownloadStream(file[0]._id).pipe(res);
            // UploadFiles.UploadGFS.delete( mongoose.Types.ObjectId(file._id))
        })
    }
    catch
    {
        req.flash("error","In valid upload id")
        res.redirect("/home")
    }
})

router.get("/upload/:upload_id/image/:image_name",getUserPermissions,async(req,res) =>
{
    if(mongo.ObjectID.isValid(req.params.upload_id))
    {
        
        await UploadFiles.UploadGFS.find({metadata : mongoose.Types.ObjectId(req.params.upload_id),filename : req.params.image_name}).toArray((err,file)=>{
            if(!file || file.length === 0 ) return res.status(400).send("no files exists")
            UploadFiles.UploadGFS.openDownloadStream(file[0]._id).pipe(res);
            // UploadFiles.UploadGFS.delete( mongoose.Types.ObjectId(file._id))
        })
    }
    else
    {
        req.flash("error","In valid upload id")
        res.redirect("/home")
    }

})

router.get("/upload/:upload_id/comment/:comment_id/image/:image_name",getUserPermissions,async(req,res) =>
{
    if(mongo.ObjectID.isValid(req.params.upload_id))
    {
        if(mongo.ObjectID.isValid(req.params.comment_id))
        {
            await UploadFiles.UploadGFS.find({
                filename : req.params.image_name,
                metadata : mongoose.Types.ObjectId(req.params.comment_id),
                }).toArray(async(err,files)=>{
                    if(!files || files.length === 0 ) return res.status(400).send("no files exists");
                    if( err) return res.status(404).send(err);
                    await UploadFiles.UploadGFS.find({ _id : files[0]._id}).toArray(async (error,file)=>{
                        if(error) return res.status(400).send("no files exists");
                        if(file) await UploadFiles.UploadGFS.openDownloadStream(mongoose.Types.ObjectId(files[0]._id)).pipe(res)
                    });
            })

        }else
        {
            req.flash("error","In valid comment id")
            res.redirect("/home")
        }
    }
    else
    {
        req.flash("error","In valid upload id")
        res.redirect("/home")
    }


})

router.delete("/upload/:upload_id",getUserPermissions,async (req,res) => 
{
    
    if(mongo.ObjectID.isValid(req.params.upload_id))
    {
        const user = await typeof req.user !='undefined' ? await res.locals.User : undefined;
        const userPermissions = res.locals.Permissions;

        
        const doc = await upload.GetUploadById(req.params.upload_id);

        if(doc.User && user && user._id.toString() == doc.User._id || userPermissions.Values[`${req.method.toLowerCase()}${doc.Type.toLowerCase()}s`] < doc.Level )
        {
            if(await upload.DeleteUploadById(req.params.upload_id))
            {
                req.flash('success','Upload Deleted');
                let files = [...doc.Content.images];
                
            }
            else
            {
                req.flash('error',`Something went wrong`);
            }
        }
        else
        {
            req.flash('error',`You're not authorized to manage this document `);

        }
        res.redirect("/home")
    }
    else
    {
        req.flash("error","In valid upload id")
        res.redirect("/home")
    }
    
})

router.delete("/upload/:upload_id/comment/:comment_id",getUserPermissions,async (req,res) => 
{
    if(mongo.ObjectID.isValid(req.params.upload_id))
    {
        if(mongo.ObjectID.isValid(req.params.comment_id))
        {
            const user = await typeof req.user !='undefined' ? await res.locals.User : undefined;
            const userPermissions = res.locals.Permissions;
            const doc = await upload.GetCommentById(req.params.comment_id);        
        
            if(user && doc.User &&  user._id.toString() == doc.User._id.toString() || userPermissions.Values[`${req.method.toLowerCase()}${doc.Type.toLowerCase()}s`] < doc.Level)
            {
                await upload.DeleteUploadComment(req.params.comment_id);
                req.flash('success',`Comment has been deleted`)
            }
            else
            {
                req.flash('error',`you can't modify this document`)
            }
        }
        else
        {
            req.flash("error","In valid comment id")
            res.redirect("/home")
        }
    }
    else
    {
        req.flash("error","In valid upload id")
        res.redirect("/home")
    }
    res.redirect("/home")
})

module.exports =router;