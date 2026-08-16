import { Router } from "express";
import { createAlumni, createStudent, deleteAlumni, deleteStudent, getDashboard, updateAlumni, updateStudent } from "../controllers/adminController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();
router.use(requireAuth(["admin"]));
router.get("/dashboard", getDashboard);
router.post("/students", createStudent);
router.patch("/students/:id", updateStudent);
router.delete("/students/:id", deleteStudent);
router.post("/alumni", createAlumni);
router.patch("/alumni/:id", updateAlumni);
router.delete("/alumni/:id", deleteAlumni);
export default router;
