const noteRouter = require("express").Router();

const {
  getAllNotes,
  getNote,
  createNote,
  updateNote,
  deleteNote,
} = require("../controllers/note.js");

noteRouter.route("/getAll").get(getAllNotes);
noteRouter.route("/create").post(createNote);
noteRouter.route("/delete").delete(deleteNote);
noteRouter.route("/:noteId").get(getNote);
noteRouter.route("/:noteId").put(updateNote);

module.exports = noteRouter;

// base route /note
