const authRouter = require("express").Router();

const {
    signin,
    signup,
    signout,
    checkAuth,
} = require("../controllers/auth.js");

authRouter.route("/signin").post(signin);
authRouter.route("/signup").post(signup);
authRouter.route("/signout").get(signout);
authRouter.route("/checkauth").get(checkAuth);

module.exports = authRouter;
