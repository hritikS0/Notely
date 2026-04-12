import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      default: "",
    },
    todos: {
      type: [{
        text: String,
        completed: Boolean,
      }],
      default: [],
    },
    isTodoCompleted: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      enum: ["normal", "todo"],
      default: "normal",
    },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for better performance
noteSchema.index({ ownerId: 1, updatedAt: -1 });
noteSchema.index({ ownerId: 1, type: 1 });
noteSchema.index({ name: "text", title: "text", content: "text" });

// Virtual for todo completion progress
noteSchema.virtual('todoProgress').get(function() {
  if (this.type !== 'todo' || !this.todos.length) return 0;
  const completed = this.todos.filter(todo => todo.completed).length;
  return (completed / this.todos.length) * 100;
});

// Pre-save middleware
noteSchema.pre('save', function(next) {
  if (this.type === 'todo') {
    const hasTodos = this.todos && this.todos.length > 0;
    const hasContent = this.content && this.content.trim().length > 0;
    if (!hasTodos && !hasContent) {
      next(new Error('Todo notes must have either todos or content'));
    }
  } else if (this.type === 'normal' && !this.content) {
    next(new Error('Normal notes must have content'));
  }
  next();
});

const Note = mongoose.model("Note", noteSchema);
export default Note;