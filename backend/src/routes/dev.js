const devRouter = require("express").Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const {
    getUserWithId,
    deleteUserWithId,
    getAllUsers,
    deleteAllUser,
    createNewUser,
    uploadAvatar,
    createNewCompanion,
    deleteCompanion
} = require("../controllers/devUser.js");


devRouter.route("/user/:id")
    .get(getUserWithId) //get user by id or query
    .delete(deleteUserWithId); //delete user by id or query

devRouter.post("/user", createNewUser); // new user

devRouter.route("/allUsers")
    .get(getAllUsers) //get all users  
    .delete(deleteAllUser); //delete all users


devRouter.route("/companion")
    .post(upload.single('avatar'), createNewCompanion) // create new companion
    .delete(deleteCompanion); // delete companion


module.exports = devRouter;

//base route /dev