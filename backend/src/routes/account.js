const accountRouter = require("express").Router();

const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const {
    deleteAccount,
    uploadAvatar,
    getAccount
} = require("../controllers/account.js");

accountRouter.route("/")
    .get(getAccount);
accountRouter.route("/delete")
    .delete(deleteAccount);
accountRouter.route("/avatar")
    .post(upload.single('avatar'), uploadAvatar);

module.exports = accountRouter;

//base route /account
