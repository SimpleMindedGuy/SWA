module.exports = {

    Resources:
    {
        "users" : "Grants some access to other users data.\nwrite : ability able to create a new user.\nRead : ability to view some of the other users data.\ndelete : ability to delete other users.\nManage : ability to add or remove roles form users",


        "posts" : "Grants access to uploads of type of (post)\nwrite : ability to create uploads of type (post)\nread : be able to view other's uploads of type (post)\ndelete : ability to delete other's uploads of type (post)\nManage : show/hide other's uploads of type (post) and limit who can comment on the upload",


        "projects" : "Grants access to uploads of type of (project)\nwrite : ability to create uploads of type (project)\nread : be able to view other's uploads of type (project)\ndelete : ability to delete other's uploads of type (project)\nManage : show/hide other's uploads of type (project) and limit who can comment on the upload",

        "blogs" : "Grants access to all uploads of type of (blog)\nwrite : ability to create uploads of type (blog)\nread : be able to view other's uploads of type (blog)\ndelete : ability to delete other's uploads of type (blog)\nManage : show/hide other's uploads of type (blog) and limit who can comment on the upload",


        "comments" : "Grants access to uploads of type of (blog)\nwrite : ability to create uploads of type (blog)\nread : be able to view other's uploads of type (blog)\ndelete : ability to delete other's uploads of type (blog)\nManage : does nothing yet",

        "roles" : "Grants access to Roles(User Groups)\nwrite : ability to create new Role\nread : be able to view Roles\ndelete : ability to delete Roles\nManage : Edit Roles permissions (Resources and actions)",

        "groups" : "Grants access to Groups\nwrite : ability to create new Groups\nread : be able to view Groups\ndelete : ability to delete Groups\nManage : Edit Groups settings (public or private and Roles within the groups)\nNOTE: this feature is not implemented yet",
    },
    Actions:
    {
        "write"  : "Grants ability to create a resource element and delete edit and manage that element",

        "read"   : "Grants ability to view a resource elements created by other users can have access to all or some of the data",

        "delete" : "Grants ability to delete a resource elements create by other users\n",

        "update" : "Grants ability to Edit a resource element created by other users\nNOTE: this feature is not implemented yet",

        "manage" : "Grants ability to show/hide/highlight a resource element created by other users from other users\nNOTE: this feature is not implemented yet",

        "block"  : "Grants ability to Block a resource element created by other users.\n(make element unable to interact with the user and vice versa)\nNOTE: this feature is not implemented yet",

        "follow" : "Grants ability to Follow a resource element created by other users or follow users.\n(make it easy to keep up with projects and blogs or just follow a specific user uploads)\nNOTE: this feature is not implemented yet",

        "ban"    : "Grants ability to permanently or temporarily ban a user form accessing a group or the whole webapp\nNOTE: this feature is not implemented yet",
    },
}