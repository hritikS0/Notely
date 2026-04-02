import crypto from "crypto";
import NoteShare from "../../models/Note/noteShares.model.js"
import Note from "../../models/Note/note.model.js";
class NoteShareService{
    async createShare(ownerId,noteId ,expiresAt){
        const note = await Note.findOne({_id:noteId,ownerId})
        if(!note) throw new Error("Note not found");
        const shareToken = crypto.randomBytes(24).toString("hex");  
        const share = await NoteShare.create({
            noteId,
            shareToken,
            createdBy: ownerId,
            expiresAt : expiresAt || null
        })
        return share;
    }
     async getSharedNote(shareToken) {
    const share = await NoteShare.findOne({ shareToken });
    if (!share) throw new Error("Share link invalid");

    if (share.expiresAt && share.expiresAt < new Date()) {
      throw new Error("Share link expired");
    }

    const note = await Note.findById(share.noteId);
    if (!note) throw new Error("Note not found");

    return note;
  }
}

export default new NoteShareService();