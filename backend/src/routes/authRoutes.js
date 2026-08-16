import { Router } from "express";
import {
  getCurrentUser,
  loginAdmin,
  loginAlumni,
  loginStudent,
} from "../controllers/authController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/student/login", loginStudent);
router.post("/alumni/login", loginAlumni);
router.post("/admin/login", loginAdmin);
router.get("/me", requireAuth(["student", "alumni", "admin"]), getCurrentUser);

export default router;
