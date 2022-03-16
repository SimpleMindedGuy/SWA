# Simple WS
A simple website "solution" for a personal or community website.

- It can work as Personal website or as Image board.

- Role Based Access Control, to manage users permissions with User Groups.

- Very simple design.


### Configuration:
port :
By default, the app will host itself on port (6254)
to change the port 

Database :
To connect your server to your database, you need to add an environment variable (SimpleWSMongoURI)


**If you don't set the database link, the web app won’t work**

Example :

local

```JS
SimpleWSMongoURI='mongodb://127.0.0.1:27017/websiteDB'
```

using Atlas

```JS
SimpleWSMongoURI:'mongodb+srv://<USERNAME>:<password>@<ProjectName>.kftux.mongodb.net/websiteDB'
```

## Start
to start the server run the command
``` SH
npm run start
```
The server will start and try to connect to the database.

And it should be ready to use once it connects to the database

### note
This is still first “release”, so I don't expect it to work everywhere

you can also view the design on [this link](https://simplemindedguy.github.io/Personal-website-design/)

## todo
- [ ] refactor the whole web app
- [ ] refactor the design
- [ ] re work mobile design
- [ ] build the front end using Vue js
