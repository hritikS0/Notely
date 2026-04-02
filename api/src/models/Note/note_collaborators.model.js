import mongoose from "mongoose";

const noteCollaboratorsSchema = new mongoose.Schema(
  {
    noteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Note",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
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

noteCollaboratorsSchema.index({ noteId: 1, userId: 1 }, { unique: true });

export default mongoose.model("NoteCollaborator", noteCollaboratorsSchema);
