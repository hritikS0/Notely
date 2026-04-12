import mongoose from "mongoose";

const notePinSchema = new mongoose.Schema(
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
  },
  { timestamps: true }
);

// Compound unique index
notePinSchema.index({ noteId: 1, userId: 1 }, { unique: true });

const NotePin = mongoose.model("NotePin", notePinSchema);
export default NotePin;