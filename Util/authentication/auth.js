const UserGroups = require("../CRUD/User_Groups")
const Users = require("../CRUD/Users");
const KeyTable = require("../DataStructure/KeyTable").KeyTable;
const Permissions = require("../../config/permission");

module.exports = {
    //  middle ware function that checks of a used is logged in
    ensureAuthenticated : async function(req,res,next)
    {
        if(req.isAuthenticated())
        {
            return next();
        }
        req.flash('error',"please log in to view this page")
        res.redirect('/users/login')
    },

    //  middleware function that checks if user has the right permission
    getUserPermissions : async function(req,res,next)
    {
        const UserPermissions = new KeyTable();

        
        // console.log(req.baseUrl)
        if(!req.isAuthenticated())
        {
            const Group = await UserGroups.GetUserGroup("Anon");
            res.locals.Level = Group.Priority;

            for (const Act of Group.Group_Actions) {
                for (const Rec of Group.Group_Resources) {
                    if(!UserPermissions.findKey(`${Act}${Rec}s`))
                        UserPermissions.addValue(`${Act}${Rec}s`,Group.Priority)
                }
            }

            for (const Act of Group.Group_Actions) {
                if(!UserPermissions.findAct(`${Act}`))
                {
                    UserPermissions.addAct(`${Act}`)
                }
            }
            for (const Rec of Group.Group_Resources) {
                if(!UserPermissions.findRec(`${Rec}`))
                {
                    UserPermissions.addRec(`${Rec}`)
                }
            }
            // console.log(Group.Group_Actions)

             
            // console.log(UserPermissions)
            res.locals.Permissions = UserPermissions;
            return next();
        }
        else
        {
            const User = await Users.GetUserById(req.user.id)
            // console.log(User)
            // console.log(User.Roles)
            for (const role in User.Roles) {
                // console.log(role)
                // console.log(User.Roles[role])
                for (const Act of User.Roles[role].Group_Actions) {
                    for (const Rec of User.Roles[role].Group_Resources) {
                        if(!UserPermissions.findKey(`${Act}${Rec}s`))
                            UserPermissions.addValue(`${Act}${Rec}s`,User.Roles[role].Priority)
                    }
                }

                
                for (const Act of User.Roles[role].Group_Actions) {
                    if(!UserPermissions.findAct(`${Act}`))
                    {
                        UserPermissions.addAct(`${Act}`)
                    }
                }
                for (const Rec of User.Roles[role].Group_Resources) {
                    if(!UserPermissions.findRec(`${Rec}`))
                    {
                        UserPermissions.addRec(`${Rec}`)
                    }
                }
                    
                
            } 

            res.locals.User = User;
            res.locals.Permissions = UserPermissions;
            // console.log(UserPermissions)
            return next();
        }
    },

    ensureOwner :async function (req,res,next)
    {
        if(!req.isAuthenticated())
        {
            // console.log(UserPermissions)
            req.flash("error", "you're not authorized to view or change website settings")
            res.redirect("/home")
        }
        else
        {
            if(req.user.User_Groups.includes("Owner"))
            {
                next();
            }
            else
            {
                req.flash("error", "you're not authorized to view or change website settings")
                res.redirect("/home")
            }
            }

    },

    checkSetupUser :async function (req,res,next)
    {
        if(req.user && req.user.DefaultAccount)
        {
            req.flash("success","create the owner")
            console.log("owner")
            res.redirect("/users/createowner")
            // next();
        }
        // else if (req.user && req.user.SetupAccount)
        // {
        //     req.flash("success", "check settings")
        //     console.log("setup")
        //     res.redirect("/settings")
        // }
        else
        {
            // console.log("not owner")
            next();
        }
    },
    
    // getUserPermissions : async function(req,res,next)
    // {
        
    // }
}
