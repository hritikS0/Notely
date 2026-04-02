import NoteShareService from "./noteShare.service.js";

class NoteShareController {
  async createShare(req, res) {
    try {
      const { noteId, expiresAt } = req.body;
      const ownerId = req.user.id;
      const share = await NoteShareService.createShare(ownerId, noteId, expiresAt);
      res.status(201).json(share);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getSharedNote(req, res) {
    try {
      const { token } = req.params;
      const note = await NoteShareService.getSharedNote(token);
      res.status(200).json(note);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }

  async joinShare(req, res) {
    try {
      const { token } = req.params;
      const userId = req.user.id;
      const { note } = await NoteShareService.joinShare(userId, token);
      res.status(200).json({ ...note.toObject(), isCollaborated: true });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
}

export default new NoteShareController();
