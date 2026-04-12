import Note from "../../models/Note/note.model.js";
import NoteCollaborator from "../../models/Note/note_collaborators.model.js";
import NotePin from "../../models/Note/note_pin.model.js";

class NoteService{
    async buildCombinedNotes(ownerId, ownedNotes, collaborations, collabNotes) {
        const ownedIds = ownedNotes.map((n) => n._id);
        const allNoteIds = [
            ...ownedIds,
            ...collabNotes.map((n) => n._id),
        ];

        const [pins, collaboratorsForOwned] = await Promise.all([
            allNoteIds.length
                ? NotePin.find({
                    userId: ownerId,
                    noteId: { $in: allNoteIds },
                }).lean()
                : [],
            ownedIds.length
                ? NoteCollaborator.find({ noteId: { $in: ownedIds } })
                    .populate("userId", "name email")
                    .lean()
                : []
        ]);
        const pinnedIds = new Set(pins.map((p) => String(p.noteId)));

        const roleByNote = new Map(
            collaborations.map((c) => [String(c.noteId), c.role])
        );

        const collaboratorNamesByNote = new Map();
        for (const c of collaboratorsForOwned) {
            const noteKey = String(c.noteId);
            const user = c.userId;
            const label = user?.name || user?.email || "Collaborator";
            if (!collaboratorNamesByNote.has(noteKey)) {
                collaboratorNamesByNote.set(noteKey, []);
            }
            collaboratorNamesByNote.get(noteKey).push(label);
        }

        const owned = ownedNotes.map((n) => {
            const names = collaboratorNamesByNote.get(String(n._id)) || [];
            return {
                ...n,
                isCollaborated: names.length > 0,
                collaboratorNames: names,
                isSharedWithMe: false,
                isPinned: pinnedIds.has(String(n._id)),
            };
        });

        const shared = collabNotes
            .filter((n) => String(n.ownerId?._id || n.ownerId) !== String(ownerId))
            .map((n) => ({
                ...n,
                isCollaborated: true,
                collaboratorRole: roleByNote.get(String(n._id)) || "viewer",
                collaboratorNames: [
                    n.ownerId?.name || n.ownerId?.email || "Owner",
                ],
                ownerName: n.ownerId?.name || n.ownerId?.email || "Owner",
                isSharedWithMe: true,
                isPinned: pinnedIds.has(String(n._id)),
            }));

        return [...owned, ...shared];
    }

    applyFilter(notes, filter) {
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
        return notes.sort((a, b) => {
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
        return { items, page: currentPage, limit, total, totalPages };
    }

    async getNotes(ownerId, options = {}){
        const [ownedNotes, collaborations] = await Promise.all([
            Note.find({ ownerId }).lean(),
            NoteCollaborator.find({ userId: ownerId }).lean()
        ]);
        const collabNoteIds = collaborations.map((c) => c.noteId);
        const collabNotes = collabNoteIds.length
            ? await Note.find({ _id: { $in: collabNoteIds } })
                .populate("ownerId", "name email")
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
    async createNote(ownerId, data){
        const { name, title, content, type, todos, isTodoCompleted } = data || {};
        if(!name || !title){
            throw new Error("Name and title are required");
        }
        if(type === "todo"){
            const hasTodos = Array.isArray(todos) && todos.length > 0;
            const hasContent = typeof content === "string" && content.trim().length > 0;
            if(!hasTodos && !hasContent){
                throw new Error("Todo notes need items or content");
            }
        } else if(!content){
            throw new Error("Content is required");
        }
        if(!ownerId){
            throw new Error("User not found");
        }
        const note = await Note.create({
            ownerId,
            name,
            title,
            isTodoCompleted : type === "todo" ? (isTodoCompleted || false) : undefined,
            content: content || "",
            type: type || "normal",
            todos: Array.isArray(todos) ? todos : [],
        });
        return note;
    }
    async deleteNote(userId, noteId) {
        // Check if user is the owner
        const note = await Note.findOne({ ownerId: userId, _id: noteId });
        if (note) {
            await Note.findByIdAndDelete(noteId);
            await NoteCollaborator.deleteMany({ noteId });
            await NotePin.deleteMany({ noteId });
            return note;
        }

        // If not owner, check if user is a collaborator (to unshare)
        const collab = await NoteCollaborator.findOneAndDelete({ noteId, userId });
        if (collab) {
            await NotePin.deleteOne({ noteId, userId });
            return collab;
        }

        throw new Error("Note not found or you are not authorized to delete it");
    }
    async updateNote(ownerId,noteId ,data){
        const existing = await Note.findById(noteId);
        if(!existing){
            throw new Error("Note not found");
        }
        if(String(existing.ownerId) !== String(ownerId)){
            const collab = await NoteCollaborator.findOne({
                noteId,
                userId: ownerId,
                role: "editor",
            });
            if(!collab){
                throw new Error("Not authorized");
            }
        }
        const { isPinned, ...updates } = data || {};
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
        const note = await Note.findOneAndUpdate(
            { _id: noteId },
            updates,
            { new: true }
        );
        return note;
    }
    async searchNotes(ownerId, query, options = {}){
        const trimmed = typeof query === "string" ? query.trim() : "";
        if (!trimmed) return this.paginate([], options);
        const regex = new RegExp(trimmed, "i");
        const match = {
            $or: [
                { name: { $regex: regex } },
                { title: { $regex: regex } },
                { content: { $regex: regex } },
            ],
        };

        const [ownedNotes, collaborations] = await Promise.all([
            Note.find({ ownerId, ...match }).lean(),
            NoteCollaborator.find({ userId: ownerId }).lean()
        ]);
        const collabNoteIds = collaborations.map((c) => c.noteId);
        const collabNotes = collabNoteIds.length
            ? await Note.find({ _id: { $in: collabNoteIds }, ...match })
                .populate("ownerId", "name email")
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
}
export default new NoteService();
