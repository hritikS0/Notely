import mongoose from "mongoose";

const notePinSchema = new mongoose.Schema(
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
  },
  { timestamps: true }
);

notePinSchema.index({ noteId: 1, userId: 1 }, { unique: true });

const NotePin = mongoose.model("NotePin", notePinSchema);
export default NotePin;
