const upload = require("../CRUD/Uploads");
const UserGroups = require("../CRUD/User_Groups")
const Users = require("../CRUD/Users");
const UploadFiles= require("../CRUD/File_Uploads");


const TEXT = require("../Text");

const mongoose = require("mongoose")
const mongo = require("mongodb")



async function PostRequest(req,res,user,userPermissions,settings)
{
    let error=[];
    let success=[];
    const id = req.body.id;

    if(userPermissions.Values.hasOwnProperty("writeposts"))
    {
        if((req.body.Post_Content == "" || !req.body.Post_Content) && (!req.files.images ))
        {
            error.push('cant create empty post')
        }
        else{
    
            let images = [];
            if(req.files.images)
            {
                req.files.images.forEach(file => {
                    images.push(file.filename)
                });
            }
            const Content = {
                Text : req.body.Post_Content,
                images
            } 
            // console.log(userPermissions )
            const Level = await userPermissions.Values["writeposts"] 
    
            // console.log(`level : ${Level}`)
            if(upload.CreateUpload(id,user,"post",Content,Level,new Date()))
            {
                success.push('post created successfully')
            }
            else
            {
                if(req.files.images)
                {
                    req.files.images.forEach(async(file) => {
                        await UploadFiles.DeleteImage(file.filename,id)
                    })
                }
                error.push('something went wrong please try again later')
            }
        }
    }
    else
    {
        if(req.files.images)
        {
            req.files.images.forEach(async(file) => {
                await UploadFiles.DeleteImage(file.filename,id)
            })
        }
        error.push('you dont have permission to create posts')
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
    res.redirect("/home");
}
module.exports.PostRequest = PostRequest;

async function BlogRequest(req,res,user,userPermissions,settings)
{
    let nextid =await  mongoose.Types.ObjectId();
    let valid =  await TEXT.ValidateBlog(req.body.Blog_title,req.body.Blog_text)
    let id = req.body.id;
    let error=[];
    let success=[];

    if(userPermissions.Values.hasOwnProperty("writeblogs"))
    {
        if( !valid )
        {
            error.push("title and text is required");
            error.push('cant create empty post')

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

            let title="Blogs"
            let uploads = await upload.GetAllUploadsDescendingOfType("blog");
            res.render("blogs",{
                title:title,
                user:user,
                uploads:uploads,
                Blog_title : req.body.Blog_title,
                Blog_text : req.body.Blog_text,
                nextid,
                userPermissions,
                settings
            });
        }
        else
        {
            let images = [];
            if(req.files.images)
            {
                for (const file of req.files.images) {
                    images.push(file.filename)
                }
            
            }
            const Content = {
                Title   : TEXT.RemoveWhiteSpace(req.body.Blog_title),
                Text    : TEXT.RemoveWhiteSpace(req.body.Blog_text),
                images
            } 
            const Level = await userPermissions.Values["writeblogs"]

            if(await upload.CreateUpload(id,req.user,"blog",Content,Level,new Date())){
                success.push('post created successfully')
            }
            else
            {
                if(req.files.images)
                {
                    req.files.images.forEach(async(file) => {
                        await UploadFiles.DeleteImage(file.filename,id)
                    })
                }
                error.push('something went wrong please try again later')
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
            res.redirect("/blogs");
        }
    }
    else
    {
        if(req.files.images)
        {
            req.files.images.forEach(async(file) => {
                await UploadFiles.DeleteImage(file.filename,id)
            })
        }

        error.push("you don't have permission to create blog")
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
        res.redirect("/blogs");
    }
    
    
}
module.exports.BlogRequest = BlogRequest;


async function ProjectRequest(req,res,user,userPermissions,settings)
{
    let valid =  await TEXT.ValidateBlog(req.body.Project_title,req.body.Project_text)
    let id = req.body.id;
    let nextid =await  mongoose.Types.ObjectId();
    let error=[];
    let success =[];

    if(userPermissions.Values.hasOwnProperty("writeprojects"))
    {
        if( !valid )
        {
            error.push("title and text is required");

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

            if(req.files.image)
            {
                req.files.image.forEach(async(file) => {
                    await UploadFiles.DeleteImage(file.filename,id)
                })
            }

            let title = "Projects"
            let uploads = await upload.GetAllUploadsDescendingOfType("project");
            res.render("projects",{
                title:title,
                user:user,
                uploads:uploads ,
                Project_title : req.body.Project_title ,
                Project_text : req.body.Project_text,
                
                nextid,
                userPermissions,
                settings
            });
        }
        else
        {
            if(req.user == null)
            {
                user = undefined;
            }
            else
            {
                user = req.user;
            }
        
            let images = [];
            if(req.files.image)
            {
                req.files.image.forEach(file => {
                    images.push(file.filename)                
                });
            }

            
            const Content = {
                Title : TEXT.RemoveWhiteSpace(req.body.Project_title),
                Text : TEXT.RemoveWhiteSpace(req.body.Project_text),
                Status: req.body.Project_status,
                images
            }

            const Level = await userPermissions.Values["writeblogs"]

            if(await upload.CreateUpload(id,req.user,"project",Content,Level,new Date())){
                success.push('post created successfully')
            }
            else
            {

                if(req.files.images)
                {
                    req.files.images.forEach(async(file) => {
                        await UploadFiles.DeleteImage(file.filename,id)
                    })
                }
        
                error.push('something went wrong please try again later')
            }
            
        }
    }
    else
    {
        if(req.files.image)
        {
            req.files.image.forEach(async(file) => {
                await UploadFiles.DeleteImage(file.filename,id)
            })
        }

        error.push('you dont have permission to create projects')
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
    res.redirect("/projects");
    
}
module.exports.ProjectRequest = ProjectRequest;

async function CommentRequest(req,res,user,userPermissions,settings)
{
    let error=[]
    let success=[]
    const id = req.body.id;

    if(userPermissions.Values.hasOwnProperty("writeprojects"))
    {
        if(mongo.ObjectID.isValid(req.params.upload_id) )
        {
            let Comment =req.body.Comment_Text
            let Image =req.files.image
            
            if(!Image && !Comment)
            {
                error.push('cant create empty post')

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
            else
            {
                if(mongo.ObjectID.isValid(req.body.id))
                {

                    let images = [];
                    if(req.files.image)
                    {
                        req.files.image.forEach(file => {
                            images.push(file.filename)
                        });
                    }
                    let Text
                    if(Comment)
                    {
                        Text = TEXT.RemoveWhiteSpace(req.body.Comment_Text)
                    }
                    else
                    {
                        Text = ""
                    }
                    const Content = {
                        Text ,
                        images 
                    } 
                    const Level = await userPermissions.Values["writecomments"]

                    if(await upload.CreateComment(id,user,"comment",Content,new Date(),Level,req.params.upload_id)){
                        success.push('Comment created successfully')
                    }
                    else{
                        if(req.files.image)
                        {
                            req.files.image.forEach(async(file) => {
                                await UploadFiles.DeleteImage(file.filename,id)
                            })
                        }
                        error.push('something went wrong please try again later')
                    }
                
                }
                else
                {
                    if(req.files.image)
                    {
                        req.files.image.forEach(async(file) => {
                            await UploadFiles.DeleteImage(file.filename,id)
                        })
                    }
                    error.push('In valid id used to save document')
                }
                
            }
        }
        else
        {
            if(req.files.image)
            {
                req.files.image.forEach(async(file) => {
                    await UploadFiles.DeleteImage(file.filename,id)
                })
            }
            error.push("In valid upload id")
        }
    }
    else
    {
        if(req.files.image)
        {
            req.files.image.forEach(async(file) => {
                await UploadFiles.DeleteImage(file.filename,id)
            })
        }
        error.push('you dont have permissions to create comment')
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

    res.redirect("/home")
}
module.exports.CommentRequest = CommentRequest;

async function SupBlogRequest(req,res,user,userPermissions,uploads,settings)
{

    let title = uploads.Content.Title != undefined ? uploads.Content.Title : uploads.Content.Text;        
    let nextid = req.body.id;
    let error=[];
    let success=[];

    let valid =  await TEXT.ValidateBlog(req.body.Blog_title,req.body.Blog_text)
    
    if( !valid )
    {
        error.push("title and text is required");

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

        if(req.files.images)
        {
            req.files.images.forEach(async(file) => {
                await UploadFiles.DeleteImage(file.filename,id)
            })
        }
        
        res.render("upload",{
            title:title,
            user:user,
            upload:uploads ,
            Blog_title : req.body.Blog_title , 
            Blog_text : req.body.Blog_text ,
            userPermissions,
            settings
        });
    }
    else
    {

        let images = [];
        if(req.files.images)
        {
            req.files.images.forEach(file => {
                images.push(file.filename)
            });
        }
        const Content = {
            Title : req.body.Blog_title,
            Text : req.body.Blog_text,
            images
        } 
        const Level = await userPermissions.Values["writeblogs"]

        if(await upload.CreateSub_Upload(nextid,user,"blog",Content,new Date(),Level,req.params.upload_id)){
            success.push('updated successfully')
        }
        else{
            if(req.files.images)
            {
                req.files.images.forEach(async(file) => {
                    await UploadFiles.DeleteImage(file.filename,id)
                })
            }
            error.push('something went wrong please try again later')
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
    
        res.redirect(`/upload/${req.params.upload_id}`);
    }

}
module.exports.SupBlogRequest = SupBlogRequest;

async function SupProjectRequest(req,res,user,userPermissions,uploads,settings)
{
    let valid =  await TEXT.ValidateBlog(req.body.Project_title,req.body.Project_text)
    let title = uploads.Content.Title != undefined ? uploads.Content.Title : uploads.Content.Text;        
    let nextid = req.body.id;
    let error=[];
    let success=[];

    if( !valid )
    {
        error.push("title and text are required");

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

        if(req.files.image)
        {
            req.files.image.forEach(async(file) => {
                await UploadFiles.DeleteImage(file.filename,id)
            })
        }

        res.render("upload",{
            title:title,
            user:user,
            upload : uploads ,
            Project_text : req.body.Project_title ,
            Project_title : req.body.Project_text,
            userPermissions,
            settings
        });
    }
    else
    {

        if(req.user == null)
        {
            user = undefined;
        }
        else
        {
            user = req.user;
        }

        let images = [];
        const Level = await userPermissions.Values["writeprojects"]
        if(req.files.image)
        {
            req.files.image.forEach(file => {
                images.push(file.filename)
            });
        }
        const Content = {
            Title : req.body.Project_title,
            Text : req.body.Project_text,
            status : req.body.Project_status,
            images
        } 

        if(await upload.CreateSub_Upload(nextid,req.user,"project",Content,new Date(),Level,req.params.upload_id)){
            success.push('updated successfully')
        }
        else{
            if(req.files.image)
            {
                req.files.image.forEach(async(file) => {
                    await UploadFiles.DeleteImage(file.filename,id)
                })
            }
            error.push('something went wrong please try again later')
            
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
        
        res.redirect(`/upload/${req.params.upload_id}`);
    }
}
module.exports.SupProjectRequest = SupProjectRequest;


async function EditPostRequest(req,res,user,userPermissions,uploads,settings)
{
    let title = uploads.Content.Title != undefined ? uploads.Content.Title : uploads.Content.Text; 
    let nextid = mongoose.Types.ObjectId();
    let error=[];
    let success =[];
    let images=[];

    if(uploads.Content.images)
    {
        console.log("origional images : ",uploads.Content.images)
        uploads.Content.images.forEach(img =>{
            if(req.body.delete_image != undefined )
            {
                if(req.body.delete_image.indexOf(img) == -1)
                {
                    images.push(img)
                }
                else
                {
                    console.log("this image is deleted :", img)
                }
            }
            else
            {
                images.push(img)
            }
        })
    }
    if(req.files.images)
    {
        req.files.images.forEach(file => {
            images.push(file.filename)
        });
    }
    console.log("images that should be deleted : ",req.body.delete_image);
    console.log("images after remove",images)

    let valid =  await TEXT.ValidatePost(req.body.Post_Content,images)
    if( !valid )
    {
        error.push("title and text is required");
        error.push('cant create empty post');


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

        if(req.files.images)
        {
            req.files.images.forEach(async(file) => {
                await UploadFiles.DeleteImage(file.filename,id)
            })
        }

        res.render("upload",{
            title:title,
            user:user,
            upload:uploads ,
            Blog_title : req.body.Blog_title ,
            Blog_text : req.body.Blog_text,
            userPermissions,
            settings
        });
    }
    else
    {
        const Content = {
            Text : req.body.Post_Content,
            images
        }
        //              Update_Upload(Traget_id,Content,Date)
        if(await upload.Update_Upload(req.params.upload_id,Content,new Date())){
            success.push('updated successfully')
        }
        else{
            if(req.files.images)
            {
                req.files.images.forEach(async(file) => {
                    await UploadFiles.DeleteImage(file.filename,id)
                })
            }
            error.push('something went wrong please try again later')
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
module.exports.EditPostRequest = EditPostRequest;


async function EditBlogRequest(req,res,user,userPermissions,uploads,settings)
{
    let title = uploads.Content.Title != undefined ? uploads.Content.Title : uploads.Content.Text; 
    let nextid = mongoose.Types.ObjectId();
    let error=[];
    let success=[];

        console.log(req.body);
    if(user && uploads.User &&  user._id.toString() == uploads.User._id.toString())
    {
        let valid =  await TEXT.ValidateBlog(req.body.Blog_title,req.body.Blog_text)
        if( !valid )
        {
            error.push("title and text is required");
            if(error.length> 0)
            {
                req.flsah("error" , error)
            }

            if(req.files.images)
            {
                req.files.images.forEach(async(file) => {
                    await UploadFiles.DeleteImage(file.filename,id)
                })
            }

            res.render("upload",{
                title:title,
                user:user,
                upload:uploads ,
                Blog_title : req.body.Blog_title ,
                Blog_text : req.body.Blog_text,
                userPermissions,
                settings
            });
        }
        else
        {
            let images = [];
            if(uploads.Content.images)
            {
                console.log("origional images : ",uploads.Content.images)
                uploads.Content.images.forEach(img =>{
                    if(req.body.delete_image != undefined )
                    {
                        if(req.body.delete_image.indexOf(img) == -1)
                        {
                            images.push(img)
                        }
                        else
                        {
                            console.log("this image is deleted :", img)
                        }
                    }
                    else
                    {
                        images.push(img)
                    }

                })
            }
            if(req.files.images)
            {
                req.files.images.forEach(file => {
                    images.push(file.filename)
                });
            }

            const Content = {
                Title : req.body.Blog_title,
                Text : req.body.Blog_text,
                images
            } 

            if(await upload.Update_Upload(req.params.upload_id,Content,new Date())){
                success.push('updated successfully')
            }
            else{
                if(req.files.images)
                {
                    req.files.images.forEach(async(file) => {
                        await UploadFiles.DeleteImage(file.filename,id)
                    })
                }
                error.push('something went wrong please try again later')
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
    else
    {
        if(req.files.images)
        {
            req.files.images.forEach(async(file) => {
                await UploadFiles.DeleteImage(file.filename,id)
            })
        }
        req.flash("error","In valid upload id")
        res.redirect("/home")
    }
}
module.exports.EditBlogRequest = EditBlogRequest;


async function EditProjectRequest(req,res,user,userPermissions,uploads,settings)
{
    let title = uploads.Content.Title != undefined ? uploads.Content.Title : uploads.Content.Text; 
    let nextid = mongoose.Types.ObjectId();
    let error=[];
    let success=[];

    console.log(req.body);
    if(user && uploads.User &&  user._id.toString() == uploads.User._id.toString())
    {
        if(uploads.Type == "project")
        {
            let valid =  await TEXT.ValidateBlog(req.body.Project_title,req.body.Project_text)
        
            if( !valid )
            {
                error.push("title and text are required");

                if(req.files.image)
                {
                    req.files.image.forEach(async(file) => {
                        await UploadFiles.DeleteImage(file.filename,id)
                    })
                }

                res.render("upload",{
                    title:title,
                    user:user,
                    upload : uploads ,
                    Project_text : req.body.Project_text ,
                    Project_title : req.body.Project_title,
                    userPermissions,
                    settings
                });
            }
            else
            {
                let images = [];
                if(uploads.Content.images)
                {
                    console.log("origional images : ",uploads.Content.images)
                    uploads.Content.images.forEach(img =>{
                        if(req.body.delete_image != undefined )
                        {
                            if(req.body.delete_image.indexOf(img) == -1)
                            {
                                images.push(img)
                            }
                            else
                            {
                                console.log("this image is deleted :", img)
                            }

                        }
                        else
                        {
                            images.push(img)
                        }

                    })
                }
                if(req.files.image)
                {
                    req.files.image.forEach(file => {
                        images.push(file.filename)
                    });
                }

                const Content = {
                    Title : req.body.Project_title,
                    Text : req.body.Project_text,
                    Status : req.body.Project_status,
                    images
                } 
                console.log("Content",Content)
                if(await upload.Update_Upload(req.params.upload_id,Content,new Date())){
                    success.push('updated successfully')
                }
                else{
                    if(req.files.image)
                    {
                        req.files.image.forEach(async(file) => {
                            await UploadFiles.DeleteImage(file.filename,id)
                        })
                    }
                    error.push('something went wrong please try again later')
                }
            }
        }
    }
    else
    {
        if(req.files.image)
        {
            req.files.image.forEach(async(file) => {
                await UploadFiles.DeleteImage(file.filename,id)
            })
        }
        req.flash('error',`you can't modify this document`)
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

    res.redirect(`/upload/${req.params.upload_id}`);

}
module.exports.EditProjectRequest = EditProjectRequest;

async function EditCommentRequest(req,res,user,userPermissions,Comment,settings)
{
    if(user && Comment.User &&  user._id.toString() == Comment.User._id.toString())
    {
        let error=[];
        let success =[];
        let images = [];

        if(Comment.Content.images)
        {
            console.log("origional images : ",Comment.Content.images)
            Comment.Content.images.forEach(img =>{
                if(req.body.delete_image != undefined )
                {
                    if(req.body.delete_image.indexOf(img) == -1)
                    {
                        images.push(img)
                    }
                    else
                    {
                        console.log("this image is deleted :", img)
                    }

                }
                else
                {
                    images.push(img)
                }
            })
        }
        if(req.files.image)
        {
            req.files.image.forEach(file => {
                images.push(file.filename)
            });
        }

        const Content={
            Text:req.body.Comment_Text,
            images
        }
        if(await upload.UpdateComment(Content,new Date(),req.params.comment_id)){
            success.push('updated successfully')
        }
        else{
            if(req.files.image)
            {
                req.files.image.forEach(async(file) => {
                    await UploadFiles.DeleteImage(file.filename,id)
                })
            }
            error.push('something went wrong please try again later')
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
    else
    {
        if(req.files.image)
        {
            req.files.image.forEach(async(file) => {
                await UploadFiles.DeleteImage(file.filename,id)
            })
        }
        req.flash('error',`you can't modify this document`)
    }
}
module.exports.EditCommentRequest = EditCommentRequest;



////////////////
async function AddUsersToGroups(req,res,user,userPermissions,ReqUsers,ReqGroups,settings)
{   
    let error=[]
    let success=[]

    if(Array.isArray(ReqUsers))
    {
        for(const USR of ReqUsers){
            const usr = await Users.GetUserByUserID(USR)
            if(usr && usr.Roles[0].Priority > userPermissions.Values["manageusers"])
            {
                if(Array.isArray(ReqGroups))
                {
                    const grp = await UserGroups.FindUserGroup(ReqGroups)
                    for(const GRP of ReqGroups){
                        if(grp)
                        {
                            console.log(GRP)
                            if(grp.Priority > userPermissions.Values["manageusers"])
                            {
                                await UserGroups.AddGroupMember(GRP,usr.id)
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
                    const grp = await UserGroups.FindUserGroup(ReqGroups)
                    if(grp)
                    {
                        if(grp.Priority > userPermissions.Values["manageusers"])
                        {
                            await UserGroups.AddGroupMember(ReqGroups,usr.id)
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

            if(Array.isArray(ReqGroups))
            {
                for(const GRP of ReqGroups){
                    const grp = await UserGroups.FindUserGroup(GRP)
                    if(grp )
                    {
                        if(grp.Priority > userPermissions.Values["manageusers"])
                        {
                            await UserGroups.AddGroupMember(GRP,usr.id)
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
                const grp = await UserGroups.FindUserGroup(ReqGroups)
                if(await UserGroups.FindUserGroup(ReqGroups))
                {
                    if(grp.Priority > userPermissions.Values["manageusers"])
                    {
                        await UserGroups.AddGroupMember(ReqGroups,usr.id)
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
module.exports.AddUsersToGroups = AddUsersToGroups;