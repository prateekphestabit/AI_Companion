const companionRouter = require("express").Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const {
    getAllCompanions,
    createCompanion,
    deleteCompanion,
    editCompanion,
    duplicateCompanion
} = require("../controllers/companion.js");

companionRouter.route("/getAll").get(getAllCompanions);
companionRouter.post("/create", upload.single('avatar'), createCompanion);
companionRouter.put("/edit", upload.single('avatar'), editCompanion);
companionRouter.post("/duplicate", upload.single('avatar'), duplicateCompanion);
companionRouter.delete("/delete", deleteCompanion);

module.exports = companionRouter;
