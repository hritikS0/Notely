import mongoose from "mongoose";

const noteSharesSchema = new mongoose.Schema(
  {
    noteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Note",
      required: true,
    },
    shareToken: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    expiresAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

const NoteShare = mongoose.model("NoteShare", noteSharesSchema);
export default NoteShare;
