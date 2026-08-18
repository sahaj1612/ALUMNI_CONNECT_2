import { useEffect, useState } from "react";
import { PortalLayout } from "../components/PortalLayout.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { apiRequest } from "../lib/api.js";

const navigation = [
  { key: "students", label: "Students" },
  { key: "alumni", label: "Alumni" },
];
const emptyStudent = { name: "", usn: "", email: "", password: "", phone: "", department: "", batch: "", skills: "" };
const emptyAlumni = { name: "", email: "", password: "", company: "", year: "" };

export function AdminPortalPage() {
  const { token } = useAuth();
  const [section, setSection] = useState("students");
  const [data, setData] = useState(null);
  const [studentForm, setStudentForm] = useState(emptyStudent);
  const [alumniForm, setAlumniForm] = useState(emptyAlumni);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");
  const [flash, setFlash] = useState("");

  async function load() {
    const response = await apiRequest("/admin/dashboard", { token });
    setData(response);
  }
  useEffect(() => { load().catch((requestError) => setError(requestError.message)); }, []);

  async function action(callback, message) {
    setError(""); setFlash("");
    try { await callback(); await load(); setFlash(message); } catch (requestError) { setError(requestError.message); }
  }
  function beginEdit(type, account) {
    setEditing({ type, id: account.id });
    if (type === "student") setStudentForm({ ...emptyStudent, ...account });
    else setAlumniForm({ ...emptyAlumni, ...account });
    setSection(type === "student" ? "students" : "alumni");
  }
  function cancelEdit(type) { setEditing(null); type === "student" ? setStudentForm(emptyStudent) : setAlumniForm(emptyAlumni); }

  if (!data) return <div className="screen-loader">{error || "Loading administrator dashboard..."}</div>;
  return <PortalLayout title="Administrator Panel" section={section} onSectionChange={setSection} navigation={navigation}>
    {flash ? <div className="alert success">{flash}</div> : null}
    {error ? <div className="alert error">{error}</div> : null}
    {section === "students" && <section className="content-stack">
      <AccountForm title={editing?.type === "student" ? "Edit Student" : "Add Student"} fields={["name", "usn", "email", "password", "phone", "department", "batch", "skills"]} form={studentForm} setForm={setStudentForm} onCancel={() => cancelEdit("student")} onSubmit={() => action(() => apiRequest(editing?.type === "student" ? `/admin/students/${editing.id}` : "/admin/students", { method: editing?.type === "student" ? "PATCH" : "POST", token, body: studentForm }), editing?.type === "student" ? "Student updated." : "Student account created.").then(() => cancelEdit("student"))} />
      <AccountsTable accounts={data.students} type="student" onEdit={beginEdit} onDelete={(id) => { if (window.confirm("Remove this student account?")) action(() => apiRequest(`/admin/students/${id}`, { method: "DELETE", token }), "Student account removed."); }} />
    </section>}
    {section === "alumni" && <section className="content-stack">
      <AccountForm title={editing?.type === "alumni" ? "Edit Alumni" : "Add Alumni"} fields={["name", "email", "password", "company", "year"]} form={alumniForm} setForm={setAlumniForm} onCancel={() => cancelEdit("alumni")} onSubmit={() => action(() => apiRequest(editing?.type === "alumni" ? `/admin/alumni/${editing.id}` : "/admin/alumni", { method: editing?.type === "alumni" ? "PATCH" : "POST", token, body: alumniForm }), editing?.type === "alumni" ? "Alumni updated." : "Alumni account created.").then(() => cancelEdit("alumni"))} />
      <AccountsTable accounts={data.alumni} type="alumni" onEdit={beginEdit} onDelete={(id) => { if (window.confirm("Remove this alumni account?")) action(() => apiRequest(`/admin/alumni/${id}`, { method: "DELETE", token }), "Alumni account removed."); }} />
    </section>}
  </PortalLayout>;
}

function AccountForm({ title, fields, form, setForm, onSubmit, onCancel }) { return <form className="panel-card content-stack" onSubmit={(e) => { e.preventDefault(); onSubmit(); }}><h3>{title}</h3><div className="form-grid">{fields.map((field) => <label key={field}>{field === "usn" ? "USN" : field[0].toUpperCase() + field.slice(1)}<input type={field === "password" ? "password" : field === "email" ? "email" : "text"} value={form[field]} placeholder={field === "password" ? "Required for new accounts; leave blank to keep" : ""} required={field !== "password" || !form.id} onChange={(e) => setForm((current) => ({ ...current, [field]: e.target.value }))} /></label>)}</div><div className="inline-actions"><button className="primary-button" type="submit">Save Account</button><button className="secondary-button" type="button" onClick={onCancel}>Cancel</button></div></form>; }
function AccountsTable({ accounts, type, onEdit, onDelete }) { const fields = type === "student" ? ["name", "usn", "email", "department", "batch"] : ["name", "email", "company", "year"]; return <div className="panel-card"><h3>{type === "student" ? "Student Accounts" : "Alumni Accounts"}</h3><table className="data-table"><thead><tr>{fields.map((field) => <th key={field}>{field.toUpperCase()}</th>)}<th>Actions</th></tr></thead><tbody>{accounts.length ? accounts.map((account) => <tr key={account.id}>{fields.map((field) => <td key={field}>{account[field] || "—"}</td>)}<td><div className="inline-actions"><button className="secondary-button" onClick={() => onEdit(type, account)}>Edit</button><button className="danger-button" onClick={() => onDelete(account.id)}>Remove</button></div></td></tr>) : <tr><td className="empty-cell" colSpan={fields.length + 1}>No accounts found.</td></tr>}</tbody></table></div>; }
