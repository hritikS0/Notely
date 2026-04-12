import NoteService from "./note.service.js";

class NoteController {
  async getNotes(req, res) {
    try {
      const { page, limit, filter } = req.query;
      const notes = await NoteService.getNotes(req.user.id, {
        page,
        limit,
        filter,
      });
      res.status(200).json(notes);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
  async createNote(req, res) {
    try {
      const { name, title, content, type, todos } = req.body;
      const ownerId = req.user.id;
      const note = await NoteService.createNote(ownerId, {
        name,
        title,
        content,
        type,
        todos,
      });
      res.status(201).json(note);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
  async deleteNote(req, res) {
    try {
      const noteId = req.params.id;
      const ownerId = req.user.id;
      const note = await NoteService.deleteNote(ownerId, noteId);
      res.status(200).json(note);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
  async updateNote(req, res) {
    try {
      const noteId = req.params.id;
      const ownerId = req.user.id;
      const { name, title, content, type, todos, isPinned } = req.body;
      const note = await NoteService.updateNote(ownerId, noteId, {
        name,
        title,
        content,
        type,
        todos,
        isPinned,
      });
      res.status(200).json(note);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
  async searchNotes(req,res){
    try {
      const query = req.query.q;
      const { page, limit, filter } = req.query;
      const notes = await NoteService.searchNotes(req.user.id, query, {
        page,
        limit,
        filter,
      });
      res.status(200).json(notes);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

export default new NoteController();
