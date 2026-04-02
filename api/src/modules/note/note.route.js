import express from "express";
import NoteController from "./note.controller.js";
import {protect} from '../../middlewares/authMiddleware.js'
const router = express.Router();

router.get("/",protect,NoteController.getNotes)
router.post("/",protect,NoteController.createNote)
router.get("/search",protect,NoteController.searchNotes)
router.patch("/update/:id",protect,NoteController.updateNote)
router.delete("/delete/:id",protect,NoteController.deleteNote)

export default router;