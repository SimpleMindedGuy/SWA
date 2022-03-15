const express = require("express");
const router = express.Router();
const Text = require("../Text");
const passport = require('passport')

const mongo = require("mongodb")
const mongoose = require("mongoose")

const WriteRequests = require("../Requests/Write");
const DeleteRequests = require("../Requests/Delete");

const UploadFiles= require("../CRUD/File_Uploads");
const Users = require("../CRUD/Users");
const UserGroups = require("../CRUD/User_Groups");
const Settings = require("../CRUD/Settings");
const { getUserPermissions } = require("../authentication/auth");
const checkSetupUser = require("../authentication/auth").checkSetupUser;



router.get(`/createowner`,getUserPermissions,async function (req,res) 
{
    const user = await typeof req.user !='undefined' ? await res.locals.User : undefined;
    const userPermissions = await res.locals.Permissions;
    const settings = await Settings.getSettings();
    
    if(user && user.DefaultAccount)
    {
        let title = "setup"
        res.render('setup',{title,user,userPermissions,settings})
    }
    else
    {
        req.flash("error", "only the default account can access this page")
        res.redirect("/home")
    }

})

router.post(`/createowner`,getUserPermissions,async function (req,res) 
{
    const user = await typeof req.user !='undefined' ? await res.locals.User : undefined;
    const userPermissions = await res.locals.Permissions;
    const settings = await Settings.getSettings();

    const{userID,username, email , password1 , password2} = req.body;
    
    let error=[];
    let success = [];
    
    if(user && user.DefaultAccount)
    {
        let title = "setup"

        if( await Users.FindUserNameId(userID) )
        {
            error.push("UserID already registered");
        }
        if(await Text.ValidateUserID(userID) || userID == "" || !userID )
        {
            error.push("User id cant contain spaces or special characters");
        }
        if(await Text.ValidateUserName(username))
        {
            error.push("User name cant start with space or contain special characters")
        }
        // if( email && await Users.FindEmail(email))
        // {
        //     errors.push("Email already registered");
        // }
        if(password1 !== password2)
        {
            error.push("passwords doesn't match ");
        }
        if(!password1 && !password2)
        {
            error.push("please enter password")
        }
    
    
        ////////// hashing password text ////////////
        //  passing the ( TEXT     , Salt rounds ) 
        const hashed = await Text.EncryptText(password1 , 10)
    
        ////////// creating user         ///////////
        if(error.length == 0)
        {
            await Users.DeleteUserByUserID("user")
            .then(async()=>{
                await Users.CreateUser(email,userID,username,hashed,"Owner",new Date())
                .then((doc)=>{
                    success.push("Owner created")
                    success.push("login with new Owner Account to change website settings")
                    console.log(doc)
                })
                .catch(async ()=>{
                    req.flash("error", "something went wrong while creating owner\n please try again")
                    req.logOut();
                    await Users.CreateDefaultOwner()
                    .then(()=>{
                        res.redirect("/users/login");
                    })
                    .catch(()=>{
                        console.log("something went wrong while re creating default owner")
                        req.flash("error", "something went wrong while re creating default owner")
                        res.redirect("/home")
                    })
                })
            })
            .catch(async()=>{
                req.flash("error", "something went wrong while deleting default owner")
                res.render("setup",{user:req.user,title,userID,error: error,username,email,password1,password2,userPermissions,settings});
            })


            if(success.length > 0 )
            {
                req.flash("success", success)
            }
            res.redirect("/users/login");
        }
        else
        {
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
            res.render("setup",{user:user,title,userID,error: error,username,email,password1,password2,userPermissions,settings});
        }
        
    }
    else
    {
        req.flash("error", "only the setup user can access this request")
        res.redirect("/home")
    }

})


router.get(`/login`,getUserPermissions,async (req,res) => 
{
    const user = await typeof req.user !='undefined' ? await res.locals.User : undefined;
    const userPermissions = await res.locals.Permissions;
    const settings = await Settings.getSettings();
    const owner = await Users.GetOwner()


    if(user)
    {
        req.flash("error","you are already logged in ")
        res.redirect('/home')
    }
    else
    {
        let title="log-in"
        res.render('login' , {title,user,userPermissions,settings,owner})
    }
})

// login handle
router.post("/login",(req,res,next) => 
{
    passport.authenticate('local',{
        successRedirect:"/home",
        successFlash: "You're now logged in",
        // successFlash:true,
        failureFlash : "wrong password or userID",
        failureRedirect:"/users/login",
        // failureFlash : true,
    })(req,res,next)

})

router.get(`/register`,getUserPermissions,async function (req,res) 
{
    const user = await typeof req.user !='undefined' ? await res.locals.User : undefined;
    const userPermissions = await res.locals.Permissions;
    const settings = await Settings.getSettings();
    const owner = await Users.GetOwner()

    if(req.isAuthenticated())
    {
        req.flash("error","you have to log out ot access the register page")
        res.redirect('/home')
    }
    else
    {
        let title="Register"
        res.render('register',{title,user,userPermissions,settings,owner})
    }
})

router.post("/register",getUserPermissions, async function (req,res)
{
    let error=[];
    let success = [];
    let title="Register";
    
    const user = await typeof req.user !='undefined' ? await res.locals.User : undefined;
    const userPermissions = await res.locals.Permissions 
    const settings = await Settings.getSettings();

    // let hashpassword;
    const{userID,username, email , password1 , password2} = req.body;


    if( await Users.FindUserNameId(userID) )
    {
        error.push("UserID already registered");
    }
    if(await Text.ValidateUserID(userID) || userID == "" || !userID )
    {
        error.push("User id cant contain spaces or special characters");
    }
    if(await Text.ValidateUserName(username))
    {
        error.push("User name cant start with space or contain special characters")
    }
    // if( email && await Users.FindEmail(email))
    // {
    //     errors.push("Email already registered");
    // }
    if(password1 !== password2)
    {
        error.push("passwords doesn't match ");
    }
    if(!password1 && !password2)
    {
        error.push("please enter password")
    }


    ////////// hashing password text ////////////
    //  passing the ( TEXT     , Salt rounds ) 
    const hashed = await Text.EncryptText(password1 , 10)

    ////////// creating user         ///////////
    if(await Users.CreateUser(email,userID,username,hashed,settings.Default_Role,new Date()))
    {
        success.push("you are registered and can log in")
        if(error.length > 0 )
        {
            req.flash("error", error)
        }
        if(success.length > 0 )
        {
            req.flash("success", success)
        }
        res.redirect("/users/login");
    }
    else
    {
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
        res.render("register",{user:req.user,title,userID,error: error,username,email,password1,password2,userPermissions,settings});
    }


});


// log out handle
router.get('/logout',(req,res,next) =>
{
    req.logOut();
    req.flash('success','you are logged out')
    res.redirect('/home')
})

router.get("/list",getUserPermissions, async (req,res)=> {
    const user = await typeof req.user !='undefined' ? await res.locals.User : undefined;
    const userPermissions = await res.locals.Permissions 
    const UserList = await Users.GetAllUsers();
    const UserGroupList = await UserGroups.GetAllUserGroups();
    const settings = await Settings.getSettings();
    const owner = await Users.GetOwner()

    let title = "User List";
    res.render("userlist", {user,UserList,UserGroupList,title,userPermissions,settings,owner})

    // console.log(title)
})

router.post("/list",getUserPermissions, async (req,res)=> {
    const user = await typeof req.user !='undefined' ? await res.locals.User : undefined;
    const userPermissions = await res.locals.Permissions 
    const settings = await Settings.getSettings();
    
    const ReqUsers  = req.body.Users;
    const Request   = req.body.request;
    const ReqGroups = req.body.Groups;
    if(Request == "delete")
    {
        console.log("deleting user/s ignoring group/s selected")
        console.log(ReqUsers)
        console.log(Request)
        DeleteRequests.DeleteUsers(req,res,user,userPermissions,ReqUsers,ReqGroups,settings)
    }
    else if(ReqUsers && ReqGroups && Request)
    {
        if(Request == "add")
        {
            console.log("adding")
            WriteRequests.AddUsersToGroups(req,res,user,userPermissions,ReqUsers,ReqGroups,settings)
        }
        else
        {
            console.log("removing")
            DeleteRequests.RemoveUsersFromGroups(req,res,user,userPermissions,ReqUsers,ReqGroups,settings)
        }
    }
    else
    {
        req.flash("error" , "users or groups where not checked\n nothing has changed")
    }
    

    res.redirect("/users/list")

    // console.log(title)
})

router.get("/:user_id",getUserPermissions, async (req,res)=> {
    if(mongo.ObjectID.isValid(req.params.user_id) )
    {
        let error=[]
        let success =[]
        
        const userinfo = await Users.GetUserById(req.params.user_id)
        const user = await typeof req.user !='undefined' ? await res.locals.User : undefined;
        const userPermissions = res.locals.Permissions;
        const settings = await Settings.getSettings();
        const owner = await Users.GetOwner()


        if(userinfo)
        {
            const title = userinfo.User_Name
            const nextid = new mongoose.Types.ObjectId()

            if(error.length > 0 )
            {
                req.flash("error", error)
            }
            if(success.length > 0 )
            {
                req.flash("success", success)
            }
            // console.log(title)
            res.render("user",{user , title , userinfo,nextid,userPermissions,settings,owner})
        }
        else
        {
            error.push("something went wrong / user dosen't exist")
            if(error.length > 0 )
            {
                req.flash("error", error)
            }
            if(success.length > 0 )
            {
                req.flash("success", success)
            }
            res.redirect("/home")
        }
    }
    else
    {
        req.flash("error","invalid user id")
        res.redirect("/home")
    }
    
})

router.post("/:user_id",getUserPermissions, async (req,res)=> {
    const userinfo = await Users.GetUserById(req.params.user_id)
    const user = await typeof req.user !='undefined' ? await res.locals.User : undefined;
    let success =[]
    let error = []

    if(user && user._id.toString() == userinfo._id.toString())
    {
        if(await Text.ValidateUserName(req.body.User_name) )
        {
            error.push("user name can't be empty");
        }
        let bio = await Text.RemoveWhiteSpace(req.body.Bio)
        let welcome = await Text.RemoveWhiteSpace(req.body.Welcome)

        if(Users.UpdateUser(user._id,req.body.User_name,welcome,bio,Date.now()))
        {
            success.push("Profile updated")
        }
        else
        {
            error.push("Something went wrong , report bug")
        }
        if(error.length > 0 )
        {
            req.flash("error", error)
        }
        if(success.length > 0 )
        {
            req.flash("success", success)
        }
        
        if(user.SetupAccount && error.length > 0)
        {
            success.push("Setup is done")
            if(success.length > 0 )
            {
                req.flash("success", success)
            }
            await Users.finishSetup();
            res.redirect("/home");
        }
        else
        {
            res.redirect(`/users/${userinfo._id}`)
        }
    }
    else
    {
        req.flash("error","your not authorized to manage this document")
        res.redirect("/home")
    }
    // console.log(title)
})

//          /users/61430515a6d9b7db132a3934/image
router.post("/:user_id/image",getUserPermissions,UploadFiles.UploadMiddleware, async (req,res)=> {
    const userinfo = await Users.GetUserById(req.params.user_id)
    const user = await typeof req.user !='undefined' ? await res.locals.User : undefined;
    let error = []
    let success = []

    if(user && user._id.toString() == userinfo._id.toString())
    {
        if(!req.files.images)
        {
            error.push("there is no input")
        }
        else
        {
            if(user.User_Image != "" || user.User_Image != undefined)
            {
                await Users.DeleteImage(user.id)
                .then(async()=>{
                    await Users.UpdateImage(userinfo._id,req.files.images[0].filename)
                    success.push("image updated")
                })
                .catch(()=>{
                    error.push("something went wrong while deleting old image")
                })

            }
            else
            {
                error.push("something went wrong, report bug")
            }
        }  
        if(error.length> 0)
        {
            req.flash("error" , error)
        }
        if(success.length > 0 )
        {
            req.flash("success", success)
        }
        res.redirect(`/users/${userinfo._id}`)
    }
    else
    {
        
        req.flash("error","your not authorized to manage this document")
        res.redirect("/home")
    }

    // console.log(title)
})

router.post("/:user_id/cover",getUserPermissions,UploadFiles.UploadMiddleware, async (req,res)=> {
    const userinfo = await Users.GetUserById(req.params.user_id)
    const user = await typeof req.user !='undefined' ? await res.locals.User : undefined;
    let error=[]
    let success = [];
    if(user && user._id.toString() == userinfo._id.toString())
    {
        if(! req.files.images)
        {
            error.push("there is no input")
        }
        else
        {
            // console.log(image)
            if(user.Cover_Image)
            {
                await Users.DeleteCover(user.id)
                .then(async()=>{
                    await Users.UpdateCover(userinfo._id,req.files.images[0].filename)
                    .then(()=>{
                        success.push("Cover updated")
                    })
                    .catch(()=>{
                        error.push("something went wrong while updating cover")
                    })
                })
                .catch(()=>{
                    error.push("something went wrong while deleting old cover")
                })

            }
            else
            {
                await Users.UpdateCover(userinfo._id,req.files.images[0].filename)
                .then(()=>{
                    success.push("Cover uploaded")
                })
                .catch(()=>{
                    error.push("something went wrong while uploading cover")
                })
            }
        }  
        if(success.length > 0 )
        {
            req.flash("success", success)
        }
        if(error.length > 0)
        {
            req.flash("error", error)
        }
        res.redirect(`/users/${userinfo._id}`);
    }
    else
    {
        req.flash("error","your not authorized to manage this document");
        res.redirect("/home");
    }
    // console.log(title)
})

router.post("/:user_id/skill",getUserPermissions,UploadFiles.UploadMiddleware, async (req,res)=> {
    const userinfo = await Users.GetUserById(req.params.user_id)
    const user = await typeof req.user !='undefined' ? await res.locals.User : undefined;
    const id = req.body.id;
    let error=[]
    let success=[]
    if(user && user._id.toString() == userinfo._id.toString())
    {
       

        if(! Text.ValidateUserName(req.body.skill_name) || req.body.skill_name == "" || !req.body.skill_name)
        {
            error.push("skill name cant have special characters");
        }
        if(req.body.skill_description != undefined)
        {
            req.body.skill_description = Text.RemoveWhiteSpace(req.body.skill_description)
        }
        else
        {
            error.push("please add a description")
        }
        if(! req.body.skill_level)
        {
            error.push("please select skill level");
        }
        let image = typeof req.files.image  != 'undefined' ? req.files.image[0].filename : undefined;

        if(await Users.AddSkill(id,req.body.skill_name,req.body.skill_description,req.body.skill_level,image,userinfo._id))
        {
            success.push("skill added");
        }
        else
        {
            error.push("incomplete information");
        }
          
        if(success.length > 0)
        {
            req.flash("success", success)
        }
        if(error.length > 0)
        {
            req.flash("error", error)
        }
        res.redirect(`/users/${userinfo._id}`);
    }
    else
    {
        
        req.flash("error","your not authorized to manage this document");
        res.redirect("/home");
    }

    // console.log(title)
})

router.post("/:user_id/contact",getUserPermissions,UploadFiles.UploadMiddleware, async (req,res)=> {
    const userinfo = await Users.GetUserById(req.params.user_id)
    const user = await typeof req.user !='undefined' ? await res.locals.User : undefined;
    const id = req.body.id;
    let error=[]
    let success=[]

    if(user && user._id.toString() == userinfo._id.toString())
    {
        if(! req.body.contact_method )
        {
            error.push("name of method is required");
            res.redirect(`/users/${userinfo._id}`);
        }
        if(! req.body.contact_link)
        {
            success.push("please add a link / email / User name");
            res.redirect(`/users/${userinfo._id}`);
        }

        let image = typeof req.files.image  != 'undefined' ? req.files.image[0].filename : undefined;

        console.log(req.body)
        if(await Users.AddContact(id,req.body.contact_method,req.body.contact_link,image,userinfo._id))
        {
            success.push("Contact added");
        }
        else
        {
            error.push("incomplete information");
            await UploadFiles.UploadGFS.find({
                filename : mongoose.Types.ObjectId(image[0].filename),
                metadata : mongoose.Types.ObjectId(userinfo._id)})
                .toArray((err,file)=>{
                if(!file || file.length === 0 ) 
                    return res.status(400).send("files doesn't exists");
                UploadFiles.UploadGFS.delete( mongoose.Types.ObjectId(file._id));
            })
        }
        if(error.length > 0 )
        {
            req.flash("error", error)
        }
        if(success.length > 0)
        {
            req.flash("success", success)
        }
        res.redirect(`/users/${userinfo._id}`);
    }
    else
    {
        req.flash("error","your not authorized to manage this document");
        res.redirect("/home");
    }

    // console.log(title)
})

router.delete("/:user_id/contact/:contact_id",getUserPermissions, async (req,res)=> {
    const userinfo = await Users.GetUserById(req.params.user_id)
    const user = await typeof req.user !='undefined' ? await res.locals.User : undefined;
    let success=[]
    let error=[]

    if(user && user._id.toString() == userinfo._id.toString())
    {
        if(Users.DeleteContact(userinfo._id,req.params.contact_id))
        {
            success.push("Contact Deleted");
        }
        else
        {
            error.push("something went wrong,report bug");
        }
        if(error.length > 0 )
        {
            req.flash("error", error)
        }
        if(success.length > 0 )
        {
            req.flash("success", success)
        }
        res.redirect(`/users/${userinfo._id}`);
    }
    else
    {
        req.flash("error","your not authorized to manage this document");
        res.redirect("/home");
    }
    // console.log(title)
})

//              /user/${userinfo._id}/skill/${skill._id}?_method=DELETE`
router.delete("/:user_id/skill/:skill_id",getUserPermissions, async (req,res)=> {
    const userinfo = await Users.GetUserById(req.params.user_id)
    const user = await typeof req.user !='undefined' ? await res.locals.User : undefined;
    let error=[]
    let success=[]

    if(user && user._id.toString() == userinfo._id.toString())
    {
        if(await Users.DeleteSkill(userinfo._id,req.params.skill_id))
        {
            success.push("success", "Skill deleted");
        }
        else
        {
            error.push("something went wrong, report bug");
        }
        res.redirect(`/users/${userinfo._id}`);
        if(error.length > 0 )
        {
            req.flash("error", error)
        }
        if(success.length > 0 )
        {
            req.flash("success", success)
        }
    }
    else
    {
        req.flash("error","your not authorized to manage this document");
        res.redirect("/home");
    }
})

router.delete("/:user_id/contact/:contact_id",getUserPermissions, async (req,res)=> {
    const userinfo = await Users.GetUserById(req.params.user_id)
    const user = await typeof req.user !='undefined' ? await res.locals.User : undefined;
    let error=[]
    let success=[]
    
    if(user && user._id.toString() == userinfo._id.toString())
    {
        if(Users.DeleteContact(userinfo._id,req.params.contact_id))
        {
            success.push("Contact deleted");
        }
        else
        {
            error.push("something went wrong, report bug");
        }
        if(error.length > 0 )
        {
            req.flash("error", error)
        }
        if(success.length > 0 )
        {
            req.flash("success", success)
        }
        res.redirect(`/users/${userinfo._id}`);
    }
    else
    {
        req.flash("error","your not authorized to manage this document");
        res.redirect("/home");
    }
})

router.get("/:user_id/image/:image_name",getUserPermissions,async (req,res)=>{
    await UploadFiles.UploadGFS.find({
        filename : req.params.image_name,
        metadata : mongoose.Types.ObjectId(req.params.user_id),
        }).toArray(async(err,files)=>{
            if(!files || files.length === 0 ) return res.status(400).send("no files exists");
            if( err) return res.status(404).send(err);
            await UploadFiles.UploadGFS.find({ _id : files[0]._id}).toArray(async (error,file)=>{
                if(error) return res.status(400).send("no files exists");
                if(file) await UploadFiles.UploadGFS.openDownloadStream(mongoose.Types.ObjectId(files[0]._id)).pipe(res)
            });
    })
    // return res.send("not found")
})


router.delete("/:user_id/cover",getUserPermissions, async (req,res)=> {
    const userinfo = await Users.GetUserById(req.params.user_id)
    const user = await typeof req.user !='undefined' ? await res.locals.User : undefined;

    if(user && user._id.toString() == userinfo._id.toString())
    {
        // console.log(image)
        if(Users.DeleteCover(userinfo._id))
        {
            if(user.User_Cover)
            {
                let image_name = user.User_Cover
                await UploadFiles.UploadGFS.find({
                    filename : image_name,
                    metadata : mongoose.Types.ObjectId(req.params.user_id),
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
            req.flash("success", "image deleted");
        }
        else
        {
            req.flash("error", "User doesn't have a cover to delete");
        }
        
        res.redirect(`/users/${userinfo._id}`);
    }
    else
    {
        req.flash("error","your not authorized to manage this document");
        res.redirect("/home");
    }

    // console.log(title)
})

router.delete("/:user_id/image",getUserPermissions,UploadFiles.UploadMiddleware, async (req,res)=> {
    const userinfo = await Users.GetUserById(req.params.user_id)
    const user = await typeof req.user !='undefined' ? await res.locals.User : undefined;
    let error=[]
    let success=[]
    if(user && user._id.toString() == userinfo._id.toString())
    {

        if(await Users.DeleteImage(userinfo._id))
        {
            success.push("image deleted")
        }
        else
        {
            error.push("User doesn't have an image to delete")
        }
        if(error.length > 0 )
        {
            req.flash("error", error)
        }
        if(success.length > 0 )
        {
            req.flash("success", success)
        }
        res.redirect(`/users/${userinfo._id}`)
    }
    else
    {
        req.flash("error","your not authorized to manage this document")
        res.redirect("/home")
    }

    // console.log(title)
})




module.exports =router;