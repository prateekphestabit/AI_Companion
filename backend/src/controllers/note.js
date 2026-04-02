const User = require("../models/User");
const logger = require("../utils/logger");
const {createNoteService} = require("../services/NoteServie");

async function getAllNotes(req, res) {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select("notes");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const noteSummaries = user.notes.map((n) => ({
      _id: n._id,
      title: n.title,
      preview: n.content.length > 100 ? n.content.substring(0, 100) + "..." : n.content,
      createdAt: n.createdAt,
      updatedAt: n.updatedAt,
    }));

    res.status(200).json({ success: true, notes: noteSummaries });
  } catch (error) {
    logger.error("Error in getAllNotes", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
}

async function getNote(req, res) {
  try {
    const userId = req.user._id;
    const { noteId } = req.params;

    const user = await User.findById(userId).select("notes");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const note = user.notes.id(noteId);
    if (!note) {
      return res.status(404).json({ success: false, message: "Note not found" });
    }

    res.status(200).json({ success: true, note });
  } catch (error) {
    logger.error("Error in getNote", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
}

async function createNote(req, res) {
  try {
    const userId = req.user._id;
    const { title, content } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: "Title is required" });
    }
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: "Content is required" });
    }

    let user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // createNoteService shared between llmToolCalling and Create Note controller
    await createNoteService(userId, title.trim(), content.trim());
    user = await User.findById(userId);
    const createdNote = user.notes[user.notes.length - 1];
    res.status(201).json({ success: true, message: "Note created", note: createdNote });
  } catch (error) {
    logger.error("Error in createNote", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
}

async function updateNote(req, res) {
  try {
    const userId = req.user._id;
    const { noteId } = req.params;
    const { title, content } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const note = user.notes.id(noteId);
    if (!note) {
      return res.status(404).json({ success: false, message: "Note not found" });
    }

    if (title && title.trim()) note.title = title.trim();
    if (content !== undefined) note.content = content;
    await user.save();

    res.status(200).json({ success: true, message: "Note updated", note });
  } catch (error) {
    logger.error("Error in updateNote", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
}

async function deleteNote(req, res) {
  try {
    const { noteId } = req.body;
    const userId = req.user._id;

    if (!noteId) {
      return res.status(400).json({ success: false, message: "noteId is required" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $pull: { notes: { _id: noteId } } },
      { returnDocument: "after" }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, message: "Note deleted" });
  } catch (error) {
    logger.error("Error in deleteNote", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
}

module.exports = {
  getAllNotes,
  getNote,
  createNote,
  updateNote,
  deleteNote,
};
