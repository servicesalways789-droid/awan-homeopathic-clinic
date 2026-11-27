"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import AppNav from "@/components/AppNav";

type Branch = { id: string; name: string; address: string };
type Patient = { id: string; patient_code: string | null; full_name: string; phone: string | null; date_of_birth: string | null; sex: string | null; address: string | null; created_at: string };
type Profile = { role: string; branch_id: string | null };

export default function PatientsPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [branchId, setBranchId] = useState("");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({ full_name: "", phone: "", date_of_birth: "", sex: "", address: "", notes: "" });

  const isGlobalAdmin = profile?.role === "owner" || profile?.role === "admin";

  async function loadPatients(selectedBranch = branchId) {
    if (!selectedBranch) { setPatients([]); return; }
    const { data, error: queryError } = await supabase.from("patients")
      .select("id,patient_code,full_name,phone,date_of_birth,sex,address,created_at")
      .eq("branch_id", selectedBranch).order("created_at", { ascending: false }).limit(200);
    if (queryError) throw queryError;
    setPatients((data || []) as Patient[]);
  }

  useEffect(() => {
    let active = true;
    async function init() {
      try {
        const { data: auth } = await supabase.auth.getUser();
        if (!auth.user) { router.replace("/login"); return; }
        const { data: staff, error: staffError } = await supabase.from("staff_profiles")
          .select("role,branch_id").eq("user_id", auth.user.id).single();
        if (staffError) throw new Error("Your staff profile is not configured. Ask the system administrator to assign your role and branch.");
        const p = staff as Profile;
        const { data: branchRows, error: branchError } = await supabase.from("branches")
          .select("id,name,address").eq("is_active", true).order("name");
        if (branchError) throw branchError;
        if (!active) return;
        setProfile(p);
        setBranches((branchRows || []) as Branch[]);
        const initialBranch = p.branch_id || (branchRows?.[0]?.id ?? "");
        setBranchId(initialBranch);
        if (initialBranch) {
          const { data, error: patientError } = await supabase.from("patients")
            .select("id,patient_code,full_name,phone,date_of_birth,sex,address,created_at")
            .eq("branch_id", initialBranch).order("created_at", { ascending: false }).limit(200);
          if (patientError) throw patientError;
          if (active) setPatients((data || []) as Patient[]);
        }
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : "Unable to load patients.");
      } finally { if (active) setLoading(false); }
    }
    init();
    return () => { active = false; };
  }, [router, supabase]);

  async function changeBranch(id: string) {
    setBranchId(id); setError("");
    try { await loadPatients(id); }
    catch (e) { setError(e instanceof Error ? e.message : "Unable to load this branch."); }
  }

  async function addPatient(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setSaving(true); setError(""); setSuccess("");
    try {
      if (!branchId) throw new Error("Select a branch first.");
      const { error: insertError } = await supabase.from("patients").insert({
        branch_id: branchId,
        full_name: form.full_name.trim(),
        phone: form.phone.trim() || null,
        date_of_birth: form.date_of_birth || null,
        sex: form.sex || null,
        address: form.address.trim() || null,
        notes: form.notes.trim() || null
      });
      if (insertError) throw insertError;
      setForm({ full_name: "", phone: "", date_of_birth: "", sex: "", address: "", notes: "" });
      await loadPatients(branchId);
      setSuccess("Patient registered successfully.");
    } catch (e) { setError(e instanceof Error ? e.message : "Could not register patient."); }
    finally { setSaving(false); }
  }

  const filtered = patients.filter(p => [p.full_name, p.phone || "", p.patient_code || ""].join(" ").toLowerCase().includes(search.toLowerCase()));

  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return <><AppNav/><main className="shell">
    <header className="top">
      <div><a className="back-link" href="/">← Dashboard</a><h1>Patients</h1><p className="muted">Awan Homeopathic Clinic · Patient registration and visit records</p></div>
      <button className="secondary-btn" onClick={signOut}>Sign out</button>
    </header>
    <div className="toolbar">
      <label className="field-label">Branch
        <select value={branchId} onChange={e => changeBranch(e.target.value)} disabled={!isGlobalAdmin}>
          {branches.map(b => <option key={b.id} value={b.id}>{b.name} — {b.address}</option>)}
        </select>
      </label>
      <label className="field-label search-field">Search patients
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Name, phone or patient code" />
      </label>
    </div>
    {error && <div className="error-box" role="alert">{error}</div>}
    {success && <div className="success-box" role="status">{success}</div>}
    <div className="patient-layout">
      <section className="card">
        <h2>Register New Patient</h2>
        <form onSubmit={addPatient} className="patient-form">
          <label className="field-label">Full name *<input required maxLength={120} value={form.full_name} onChange={e => setForm({...form,full_name:e.target.value})} /></label>
          <label className="field-label">Phone number<input maxLength={30} value={form.phone} onChange={e => setForm({...form,phone:e.target.value})} /></label>
          <label className="field-label">Date of birth<input type="date" value={form.date_of_birth} onChange={e => setForm({...form,date_of_birth:e.target.value})} /></label>
          <label className="field-label">Sex<select value={form.sex} onChange={e => setForm({...form,sex:e.target.value})}><option value="">Not specified</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></select></label>
          <label className="field-label full-field">Address<input maxLength={300} value={form.address} onChange={e => setForm({...form,address:e.target.value})} /></label>
          <label className="field-label full-field">Notes<textarea rows={3} maxLength={2000} value={form.notes} onChange={e => setForm({...form,notes:e.target.value})} /></label>
          <button className="btn" disabled={saving || loading || !branchId}>{saving ? "Saving…" : "Register Patient"}</button>
        </form>
      </section>
      <section className="card">
        <div className="list-heading"><div><h2>Patient Records</h2><p className="muted">{filtered.length} patients shown · latest 200</p></div></div>
        {loading ? <p className="muted">Loading records…</p> : filtered.length === 0 ? <p className="empty-state">No patients found for this branch.</p> :
          <div className="table-wrap"><table className="data-table"><thead><tr><th>Patient</th><th>Phone</th><th>Date of birth</th><th>Sex</th><th>Registered</th></tr></thead><tbody>
            {filtered.map(p => <tr key={p.id}><td><strong>{p.full_name}</strong>{p.patient_code && <small>{p.patient_code}</small>}</td><td>{p.phone || "—"}</td><td>{p.date_of_birth || "—"}</td><td>{p.sex || "—"}</td><td>{new Date(p.created_at).toLocaleDateString()}</td></tr>)}
          </tbody></table></div>}
      </section>
    </div>
  </main></>;
}
