import { Alumni } from "../models/Alumni.js";
import { Student } from "../models/Student.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

function publicStudent(student) {
  return {
    id: student._id.toString(), name: student.name || "", usn: student.usn || "", email: student.email || "",
    phone: student.phone || "", department: student.department || "", batch: student.batch || "", skills: student.skills || "",
  };
}

function publicAlumni(alumni) {
  return {
    id: alumni._id.toString(), name: alumni.name || "", email: alumni.email || "", company: alumni.company || "", year: alumni.year || "",
  };
}

function required(value, label) {
  if (!value || !String(value).trim()) throw new ApiError(400, `${label} is required.`);
  return String(value).trim();
}

export const getDashboard = asyncHandler(async (req, res) => {
  const search = String(req.query.search || "").trim();
  const filter = search ? { $or: [{ name: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }, { usn: { $regex: search, $options: "i" } }] } : {};
  const [studentCount, alumniCount, students, alumni] = await Promise.all([
    Student.countDocuments(), Alumni.countDocuments(), Student.find(filter).sort({ name: 1 }).lean(), Alumni.find(filter).sort({ name: 1 }).lean(),
  ]);
  res.json({ summary: { studentCount, alumniCount, totalAccounts: studentCount + alumniCount }, students: students.map(publicStudent), alumni: alumni.map(publicAlumni) });
});

export const createStudent = asyncHandler(async (req, res) => {
  const { name, usn, email, password, phone = "", department = "", batch = "", skills = "" } = req.body;
  const normalizedEmail = required(email, "Email").toLowerCase();
  const normalizedUsn = required(usn, "USN").toUpperCase();
  required(name, "Name"); required(password, "Password");
  if (await Student.exists({ $or: [{ usn: normalizedUsn }, { email: normalizedEmail }] })) throw new ApiError(409, "A student with this USN or email already exists.");
  if (await Alumni.exists({ email: normalizedEmail })) throw new ApiError(409, "This email is already used by an alumni account.");
  const student = await Student.create({ name: name.trim(), usn: normalizedUsn, email: normalizedEmail, password, phone, department, batch, skills });
  res.status(201).json({ student: publicStudent(student) });
});

export const createAlumni = asyncHandler(async (req, res) => {
  const { name, email, password, company = "", year = "" } = req.body;
  const normalizedEmail = required(email, "Email").toLowerCase();
  required(name, "Name"); required(password, "Password");
  if (await Alumni.exists({ email: normalizedEmail }) || await Student.exists({ email: normalizedEmail })) throw new ApiError(409, "An account with this email already exists.");
  const alumni = await Alumni.create({ name: name.trim(), email: normalizedEmail, password, company, year });
  res.status(201).json({ alumni: publicAlumni(alumni) });
});

export const updateStudent = asyncHandler(async (req, res) => {
  const { password, ...fields } = req.body;
  const updates = { ...fields };
  if (updates.usn) updates.usn = updates.usn.trim().toUpperCase();
  if (updates.email) updates.email = updates.email.trim().toLowerCase();
  if (password) updates.password = password;
  const student = await Student.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
  if (!student) throw new ApiError(404, "Student not found.");
  res.json({ student: publicStudent(student) });
});

export const updateAlumni = asyncHandler(async (req, res) => {
  const { password, ...fields } = req.body;
  const updates = { ...fields };
  if (updates.email) updates.email = updates.email.trim().toLowerCase();
  if (password) updates.password = password;
  const alumni = await Alumni.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
  if (!alumni) throw new ApiError(404, "Alumni account not found.");
  res.json({ alumni: publicAlumni(alumni) });
});

export const deleteStudent = asyncHandler(async (req, res) => {
  if (!await Student.findByIdAndDelete(req.params.id)) throw new ApiError(404, "Student not found.");
  res.status(204).end();
});

export const deleteAlumni = asyncHandler(async (req, res) => {
  if (!await Alumni.findByIdAndDelete(req.params.id)) throw new ApiError(404, "Alumni account not found.");
  res.status(204).end();
});
