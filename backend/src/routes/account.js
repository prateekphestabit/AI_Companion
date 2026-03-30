const accountRouter = require("express").Router();

const {
    deleteAccount
} = require("../controllers/account.js");

accountRouter.route("/delete")
    .delete(deleteAccount);

module.exports = accountRouter;

//base route /account
