const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require ('bcryptjs')
const Users = require("../CRUD/Users");


// Load user model 
const User = require("../mongoose/schemas/User-Schema")

module.exports = async function(passport)
{
    passport.use(
        new LocalStrategy({usernameField: 'userID'},async (UserID,Password,done) =>
        {
            // Match User
            await Users.GetUserByUserID(UserID)
            .then(async (user)=>{
                if(!user)
                {
                    return done(null,false,{message : 'UserID is not registered'});
                }
                // Match password
                await bcrypt.compare(Password,user.Password,(err , isMatch) => 
                {
                    if(err) throw err;
                    
                    if(isMatch)
                    {
                        return done(null,user);
                    }
                    else
                    {
                        return done (null,false , {message :'Wrong password or user name'})
                    }
                })
            })
            .catch((err)=>{
                console.log(err);
            })
        })
    );

    passport.serializeUser((user,done)=>{
        done(null,user.id);
    })
    passport.deserializeUser(async(id,done)=>{
        await User.findById(id,(err,user)=>{
            done(err,user);
        });
    })
}

