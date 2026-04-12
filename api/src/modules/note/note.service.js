import Note from "../../models/Note/note.model.js";
import NoteCollaborator from "../../models/Note/note_collaborators.model.js";
import NotePin from "../../models/Note/note_pin.model.js";
import NoteShare from "../../models/Note/noteShares.model.js";
import User from "../../models/User/user.model.js";

class NoteService {
  async buildCombinedNotes(ownerId, ownedNotes, collaborations, collabNotes) {
    const ownedIds = ownedNotes.map((n) => n._id);
    const allNoteIds = [...ownedIds, ...collabNotes.map((n) => n._id)];

    const [pins, collaboratorsForOwned, currentUser] = await Promise.all([
      allNoteIds.length
        ? NotePin.find({
            userId: ownerId,
            noteId: { $in: allNoteIds },
          }).lean()
        : [],
      ownedIds.length
        ? NoteCollaborator.find({ noteId: { $in: ownedIds } })
            .populate("userId", "name email avatarId")
            .lean()
        : [],
      User.findById(ownerId).select("_id name email avatarId").lean(),
    ]);

    const pinnedIds = new Set(pins.map((p) => String(p.noteId)));

    const currentUserObj = currentUser
      ? {
          _id: currentUser._id,
          name: currentUser.name,
          email: currentUser.email,
          avatarId: currentUser.avatarId || null,
        }
      : null;

    const roleByNote = new Map(
      collaborations.map((c) => [String(c.noteId), c.role])
    );

    const collaboratorsByNote = new Map();
    for (const c of collaboratorsForOwned) {
      const noteKey = String(c.noteId);
      const user = c.userId;
      if (!user) continue;

      if (!collaboratorsByNote.has(noteKey)) {
        collaboratorsByNote.set(noteKey, []);
      }
      collaboratorsByNote.get(noteKey).push({
        _id: user._id,
        name: user.name,
        email: user.email,
        avatarId: user.avatarId || null,
      });
    }

    const owned = ownedNotes.map((n) => {
      const collabs = collaboratorsByNote.get(String(n._id)) || [];
      return {
        ...n,
        owner: currentUserObj,
        isCollaborated: collabs.length > 0,
        collaborators: collabs,
        collaboratorNames: collabs.map((c) => c.name || c.email || "Collaborator"),
        isSharedWithMe: false,
        isPinned: pinnedIds.has(String(n._id)),
      };
    });

    const shared = collabNotes
      .filter((n) => String(n.ownerId?._id || n.ownerId) !== String(ownerId))
      .map((n) => {
        const ownerUser = n.ownerId || {};
        const ownerObj = {
          _id: ownerUser._id,
          name: ownerUser.name,
          email: ownerUser.email,
          avatarId: ownerUser.avatarId || null,
        };
        return {
          ...n,
          owner: ownerObj,
          collaborators: [ownerObj],
          isCollaborated: true,
          collaboratorRole: roleByNote.get(String(n._id)) || "viewer",
          collaboratorNames: [ownerUser.name || ownerUser.email || "Owner"],
          ownerName: ownerUser.name || ownerUser.email || "Owner",
          isSharedWithMe: true,
          isPinned: pinnedIds.has(String(n._id)),
        };
      });

    return [...owned, ...shared];
  }

  applyFilter(notes, filter) {
    if (!filter) return notes;

    switch (filter) {
      case "pinned":
        return notes.filter((n) => n.isPinned);
      case "shared":
        return notes.filter((n) => n.isCollaborated || n.isSharedWithMe);
      case "todos":
        return notes.filter((n) => n.type === "todo");
      case "notes":
        return notes.filter((n) => n.type !== "todo");
      default:
        return notes;
    }
  }

  sortNotes(notes) {
    return [...notes].sort((a, b) => {
      const aPinned = a?.isPinned ? 1 : 0;
      const bPinned = b?.isPinned ? 1 : 0;
      if (aPinned !== bPinned) return bPinned - aPinned;
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    });
  }

  paginate(notes, options) {
    const page = Math.max(parseInt(options?.page || 1, 10), 1);
    const limit = Math.max(parseInt(options?.limit || 12, 10), 1);
    const total = notes.length;
    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);
    const currentPage = totalPages === 0 ? 1 : Math.min(page, totalPages);
    const start = (currentPage - 1) * limit;
    const items = notes.slice(start, start + limit);

    return {
      items,
      page: currentPage,
      limit,
      total,
      totalPages,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1,
    };
  }

  async getNotes(ownerId, options = {}) {
    if (!ownerId) {
      throw new Error("User ID is required");
    }

    const [ownedNotes, collaborations] = await Promise.all([
      Note.find({ ownerId }).lean(),
      NoteCollaborator.find({ userId: ownerId }).lean(),
    ]);

    const collabNoteIds = collaborations.map((c) => c.noteId);
    const collabNotes = collabNoteIds.length
      ? await Note.find({ _id: { $in: collabNoteIds } })
          .populate("ownerId", "name email avatarId")
          .lean()
      : [];

    const combined = await this.buildCombinedNotes(
      ownerId,
      ownedNotes,
      collaborations,
      collabNotes
    );
    const filtered = this.applyFilter(combined, options.filter);
    const sorted = this.sortNotes(filtered);
    return this.paginate(sorted, options);
  }

  async createNote(ownerId, data) {
    if (!ownerId) {
      throw new Error("User not found");
    }

    const { name = "Untitled", title = "Untitled", content = "", type = "normal", todos, isTodoCompleted } = data || {};

    const note = await Note.create({
      ownerId,
      name,
      title,
      isTodoCompleted: type === "todo" ? isTodoCompleted || false : undefined,
      content: content || "",
      type: type || "normal",
      todos: Array.isArray(todos) ? todos.map(todo => 
        typeof todo === 'string' ? { text: todo, completed: false } : todo
      ) : [],
    });

    return note;
  }

  async deleteNote(userId, noteId) {
    if (!userId || !noteId) {
      throw new Error("User ID and Note ID are required");
    }

    // Check if user is the owner
    const note = await Note.findOne({ ownerId: userId, _id: noteId });
    if (note) {
      await Note.findByIdAndDelete(noteId);
      await NoteCollaborator.deleteMany({ noteId });
      await NotePin.deleteMany({ noteId });
      await NoteShare.deleteMany({ noteId });
      return { success: true, message: "Note deleted successfully" };
    }

    // If not owner, check if user is a collaborator (to unshare)
    const collab = await NoteCollaborator.findOneAndDelete({ noteId, userId });
    if (collab) {
      await NotePin.deleteOne({ noteId, userId });
      return { success: true, message: "Removed from shared note" };
    }

    throw new Error("Note not found or you are not authorized to delete it");
  }

  async updateNote(ownerId, noteId, data) {
    if (!ownerId || !noteId) {
      throw new Error("User ID and Note ID are required");
    }

    const existing = await Note.findById(noteId);
    if (!existing) {
      throw new Error("Note not found");
    }

    // Check authorization
    if (String(existing.ownerId) !== String(ownerId)) {
      const collab = await NoteCollaborator.findOne({
        noteId,
        userId: ownerId,
        role: "editor",
      });
      if (!collab) {
        throw new Error("Not authorized to edit this note");
      }
    }

    const { isPinned, ...updates } = data || {};

    // Handle pinning
    if (typeof isPinned === "boolean") {
      if (isPinned) {
        await NotePin.updateOne(
          { noteId, userId: ownerId },
          { $setOnInsert: { noteId, userId: ownerId } },
          { upsert: true }
        );
      } else {
        await NotePin.deleteOne({ noteId, userId: ownerId });
      }
    }

    // Handle todo completion
    if (updates.type === "todo" && updates.todos) {
      const allCompleted = updates.todos.every(todo => todo.completed);
      updates.isTodoCompleted = allCompleted;
    }

    const note = await Note.findOneAndUpdate(
      { _id: noteId },
      updates,
      { new: true, runValidators: true }
    );

    return note;
  }

  async searchNotes(ownerId, query, options = {}) {
    if (!ownerId) {
      throw new Error("User ID is required");
    }

    const trimmed = typeof query === "string" ? query.trim() : "";
    if (!trimmed) {
      return this.paginate([], options);
    }

    const regex = new RegExp(trimmed, "i");
    const match = {
      $or: [{ name: { $regex: regex } }, { title: { $regex: regex } }, { content: { $regex: regex } }],
    };

    const [ownedNotes, collaborations] = await Promise.all([
      Note.find({ ownerId, ...match }).lean(),
      NoteCollaborator.find({ userId: ownerId }).lean(),
    ]);

    const collabNoteIds = collaborations.map((c) => c.noteId);
    const collabNotes = collabNoteIds.length
      ? await Note.find({ _id: { $in: collabNoteIds }, ...match })
          .populate("ownerId", "name email avatarId")
          .lean()
      : [];

    const combined = await this.buildCombinedNotes(
      ownerId,
      ownedNotes,
      collaborations,
      collabNotes
    );
    const filtered = this.applyFilter(combined, options.filter);
    const sorted = this.sortNotes(filtered);
    return this.paginate(sorted, options);
  }

  async shareNote(userId, noteId, options = {}) {
    if (!userId || !noteId) {
      throw new Error("User ID and Note ID are required");
    }

    // Check if user owns the note
    const note = await Note.findOne({ _id: noteId, ownerId: userId });
    if (!note) {
      throw new Error("You can only share notes you own");
    }

    const share = await NoteShare.createShare(noteId, userId, options);
    return share;
  }

  async getSharedNote(token) {
    if (!token) {
      throw new Error("Share token is required");
    }

    const share = await NoteShare.findOne({ shareToken: token });
    if (!share) {
      throw new Error("Invalid share link");
    }

    if (!share.isValid()) {
      throw new Error("Share link has expired");
    }

    await share.incrementViews();

    const note = await Note.findById(share.noteId)
      .populate("ownerId", "name email avatarId")
      .lean();

    if (!note) {
      throw new Error("Note not found");
    }

    return {
      note,
      permissions: share.permissions,
    };
  }
}

export default new NoteService();