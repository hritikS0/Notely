import mongoose from "mongoose";

const noteCollaboratorsSchema = new mongoose.Schema(
  {
    noteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Note",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ["editor", "viewer"],
      default: "editor",
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

// Compound unique index
noteCollaboratorsSchema.index({ noteId: 1, userId: 1 }, { unique: true });

const NoteCollaborator = mongoose.model("NoteCollaborator", noteCollaboratorsSchema);
export default NoteCollaborator;