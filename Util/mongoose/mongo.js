require("dotenv").config()

const mongoose = require('mongoose');
mongoose.Promise = Promise;

const mongoPath = process.env.SimpleWSMongoURI;


const appFunctions = require("../../app")

const Text = require("../Text");

const Users = require("../CRUD/Users");
const Permissions = require("../CRUD/Permissions");
const UserGroups = require("../CRUD/User_Groups");

const Act_Rec = require("../../config/permission");
const Def_Act_Rec = require("../../config/Default_permission");
const Def_Act_Rec_Description = require("../../config/permissions_description")

const Settings = require("../../config/App_Settings")
const Def_Settings = require("../../config/AppDefaultSettings")
const Settings_Description = require("../../config/App_Settings_description")

const AppSettings = require("../CRUD/Settings");

// mongoose.connection.on('connected', ()=> 
// {
//     console.log("connected to database ")
// })
mongoose.connection.on('error', (err)=> 
{
    console.log(err.message);
})
mongoose.connection.on('disconnected' , ()=> {
    console.log("disconnected from db")
})


async function ConnectToMongoDB()
{
    console.log("starting mongodb . . .  ")
    return await mongoose.connect(mongoPath,{
        useNewUrlParser:true,
        useUnifiedTopology: true,
        useFindAndModify: false,
    }).then(async (DB)=> {
        console.log("\n\n\n\nRunning on start check for the data base")
        return true
    })
    .catch((err) => {
        console.log("\n\n\n\ncant connect to database")
        console.log(err)
        return false
    } );
}
module.exports.ConnectDB = ConnectToMongoDB;

async function CloseMongoDB()
{
    await mongoose.connection.close();
}
module.exports.CloseDB = CloseMongoDB;

async function CheckForCoreData()
{
    let DBs=[]
    const DB = mongoose.createConnection(mongoPath,{
        useNewUrlParser:true,
        useUnifiedTopology: true,
        useFindAndModify: false
    })
    return DB.on('open',async ()=>{
        return await DB.db.listCollections().toArray(async(err,collectionNames)=>{
            if(err){
                console.log(err)
                return false;
            }
            for (const collection in collectionNames) {
                DBs.push(collectionNames[collection].name)
            }

            // console.log(await CheckAppSettings(DBs))

            // running a check after the other starting form permissions
            const success = await CheckAppSettings(DBs)
            // console.log(success)
            if(success)
            {
                console.log("Check is done")
                return true
            }
            else{
                console.log("Something wrong with Check core data function\nif this message appeared after \'success true\' then the app is perfectly usable\nCheck is done")
                return false
            }

        })
        
    })
    
}
module.exports.CheckForCoreData = CheckForCoreData;


async function CheckAppSettings(DBs)
{

    if(DBs.indexOf("settings") == -1 || DBs.indexOf("settings") == -1)
    {
        return await CreateDefaultSettings(DBs)
    }
    else
    {
        return await CheckActAndRecCollection(DBs)
    }

}

async function CreateDefaultSettings(DBs)
{
    await AppSettings.CreateDefaultSettings()
    .then(async ()=>{
        return await CheckActAndRecCollection(DBs)
    })
    .catch(()=>{
        console.log("false at CreateDefaultSettings")
        return false
    })

}



async function CheckActAndRecCollection(DBs)
{

    if(DBs.indexOf("resources") == -1 || DBs.indexOf("actions") == -1)
    {
        return await CreateActAndRec(DBs)

    }
    else
    {
        return await CheckActAndRec(DBs)
    }


}

async function CreateActAndRec(DBs)
{
    

    // for in awaits for process make it easier to handle porcess in order
    // foreach dose not wait for process to be done
    console.log(`\n\nCreating Essential Actions and resources\n`)
    for (const Act of Act_Rec.Actions) {
        if (! await Permissions.CreateAction(Act,`${Def_Act_Rec_Description.Actions[Act]}`))
        {
            console.log(`Something went wrong while adding Action : ${Act} `);
            console.log(`false at CreateActAndRec`);
            return false
        } 
    }
    console.log(`\n\nCreating Essential resources\n`)
    for (const Rec of Act_Rec.Resources) {

        if (! await Permissions.CreateResource(Rec,`${Def_Act_Rec_Description.Resources[Rec]}`))
        {
            console.log(`Something went wrong while adding Action : ${Rec} `);
            console.log(`false at CreateActAndRec`);
            return false
        }  
    }
    console.log("Done")
    return await CheckUserGroupsCollection(DBs);
    
    
}

async function CheckActAndRec(DBs)
{
 
        
    console.log(`\n////////////////////////////////\n\nChecking for essential actions`)
    for (const Act of Act_Rec.Actions) {
        if(! await Permissions.FindAction(Act))
        {
            console.log(`${Def_Act_Rec_Description.Actions[Act]}`)
            if (! await Permissions.CreateAction(Act,`${Def_Act_Rec_Description.Actions[Act]}`))
            {
                console.log(`Something went wrong while adding Action : ${Act} `);
                console.log("false at CheckActAndRec")
                return false
            } 
        }
    }

    console.log(`Checking for essential resources`)

    for (const Rec of Act_Rec.Resources) {
        if(! await Permissions.FindResource(Rec))
        {
            console.log(`Essential Resources : ${Act_Rec.Resources[Rec]} not found , creating permission`);
            if (! await Permissions.CreateResource(Rec,Def_Act_Rec_Description.Resources[Rec]))
            {
                console.log(`Something went wrong while adding Action : ${Rec} `);
                console.log("false at CheckActAndRec")
                return false
            }  
        }
    }
    
    return await CheckUserGroupsCollection(DBs)

}

async function CheckUserGroupsCollection(DBs)
{
 
    if(DBs.indexOf("user_groups") !== -1)
    {
        return await CheckOwnerUserGroup(DBs)
    }
    else
    {
        return await CreateOwnerUserGroup(DBs)
    }

}




async function CheckOwnerUserGroup(DBs)
{

    console.log("\n////////////////////////////////\n\nChecking {Owner} group Actions")
    for (const Act in Act_Rec.Actions) {
        if(!await UserGroups.FindUserGroupAction("Owner",Act_Rec.Actions[Act]))
        {
            await UserGroups.AddGroupAction("Owner",Act_Rec.Actions[Act])
            .then(()=>{

            })
            .catch((err)=>{
                console.log(err)
                console.log("Something went wrong while checking {Owner} Group Actions")
                console.log("false at CheckOwnerUserGroup")
                return false
            })
        }
    }
    console.log(`Checking {Owner} group Resources\n `)
    for (const Rec in Act_Rec.Resources) {
        if(!await UserGroups.FindUserGroupAction("Owner",Act_Rec.Resources[Rec]))
        {
            await UserGroups.AddGroupResource("Owner",Act_Rec.Resources[Rec])
            .then(()=>{

            })
            .catch((err)=>{
                console.log(err)
                console.log("Something went wrong while checking {Owner} Group Actions")
                console.log("false at CheckOwnerUserGroup")
                return false
            })
        }
    }
    console.log("////////////////////////////////\n")

    return await CheckUserGroupsNumber(DBs)
}


async function CreateOwnerUserGroup(DBs)
{
    console.log("//////////////////////////////// \n\nCreating {Owner} Group")
    return await UserGroups.CreateUserGroup("Owner",0)
    .then(async()=>{
        console.log(`\nAdding {Owner} group Actions\n`)
        for (const Act in Act_Rec.Actions) {

            await UserGroups.AddGroupAction("Owner",Act_Rec.Actions[Act])
            .then(()=>{

            })
            .catch((err)=>{
                console.log(err)
                console.log("Something went wrong while checking {Owner} Group Actions")
                console.log("false at CreateOwnerUserGroup")
                return false;
            })
        }
        console.log(`\nAdding {Owner} group Resources\n`)
        for (const Rec in Act_Rec.Resources) {
            await UserGroups.AddGroupResource("Owner",Act_Rec.Resources[Rec])
            .then(()=>{

            })
            .catch((err)=>{
                console.log(err)
                console.log("Something went wrong while checking {Owner} Group Actions")
                console.log("false at CreateOwnerUserGroup")
                return false;
            })
        }

        console.log("///////////////////////\n")
        return await CreateDefaultUserGroups(DBs)
    })
    .catch((err)=>{
        console.log(err)
        console.log("Something went wrong while adding {Owner} Group Actions and Resources")
        console.log("false at CreateOwnerUserGroup")
        return false;
    })

}

async function CheckUserGroupsNumber(DBs)
{
    const groups = await UserGroups.GetAllUserGroups()
    if(groups.length == 1)
    {
        return await CreateDefaultUserGroups(DBs)
    }
    else
    {
        return await CheckForUsers()
    }

}

async function CreateDefaultUserGroups(DBs)
{
 
    let counter =1;
    for(const group of Object.keys(Def_Act_Rec))
    {
        console.log(`\n\nCreating {${group}} Group`)
        await UserGroups.CreateUserGroup(group,counter)
        .then(async ()=>{
            for (const Act in Def_Act_Rec[group].Actions) {
                await UserGroups.AddGroupAction(group,Def_Act_Rec[group].Actions[Act])
                .then()
                .catch(err=>{
                    console.log(err)
                    console.log(`Something went wrong while Adding {${group}} Actions`)
                    console.log("false at CreateDefaultUserGroups")

                    return false
                })
            }
            for (const Rec in Def_Act_Rec[group].Resources) {
                await UserGroups.AddGroupResource(group,Def_Act_Rec[group].Resources[Rec])
                .then()
                .catch(err=>{
                    console.log(err)
                    console.log(`Something went wrong while Adding {${group}} Resources`)
                    console.log("false at CreateDefaultUserGroups")
                    return false
                })
            }
        })
        counter ++;
        console.log(`\n//////////////////////////`)
        
    }
    return await CheckForUsers()
}


async function CheckForUsers()
{
    const success = await Users.GetUsersNumber()
    .then(async (num)=>{
        if(num == 0 )
        {
            // no users where found
            console.log("no users where found the collection creating default user")

            const owner = await Users.CreateDefaultOwner()
            console.log("setup user:\nUserID : user\nPassword : 123")
            return owner
        }
        else
        {
            // console.log("users found")
            console.log(num+" users found")
            // console.log()
            console.log("checking for owner");
            
            return await CheckForOwnerUser();
        }
    })
    .catch((err)=>{
        console.log(err)
        return false
    })
    console.log("success",success)
    return success
}

async function CheckForOwnerUser()
{
    if(await Users.FindUsersOfGroup("Owner"))
    {
        console.log("Found owner user")
        return true
    }
    else
    {
        const owner = await Users.CreateDefaultOwner()
        console.log("setup user:\nUserID : user\nPassword : 123")
        return owner
    }
}