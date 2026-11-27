"use client";
import {FormEvent,useEffect,useMemo,useState} from "react";
import {useRouter} from "next/navigation";
import {createClient} from "@/lib/supabase/client";
import AppNav from "@/components/AppNav";
type Branch={id:string;name:string;address:string};
type Patient={id:string;full_name:string;phone:string|null};
type Doctor={user_id:string;full_name:string};
type Appointment={id:string;patient_id:string;doctor_user_id:string|null;scheduled_at:string;status:string};
const statuses=["requested","confirmed","completed","cancelled","no_show"];
export default function AppointmentsPage(){
 const router=useRouter(),supabase=useMemo(()=>createClient(),[]);
 const [branches,setBranches]=useState<Branch[]>([]),[branchId,setBranchId]=useState(""),[role,setRole]=useState("");
 const [patients,setPatients]=useState<Patient[]>([]),[doctors,setDoctors]=useState<Doctor[]>([]),[appointments,setAppointments]=useState<Appointment[]>([]);
 const [loading,setLoading]=useState(true),[saving,setSaving]=useState(false),[error,setError]=useState(""),[message,setMessage]=useState("");
 const [form,setForm]=useState({patient_id:"",doctor_user_id:"",scheduled_at:"",notes:""});
 async function loadBranch(id:string){
  const results=await Promise.all([
   supabase.from("patients").select("id,full_name,phone").eq("branch_id",id).order("full_name").limit(1000),
   supabase.from("staff_profiles").select("user_id,full_name").eq("branch_id",id).eq("role","doctor").eq("is_active",true).order("full_name"),
   supabase.from("appointments").select("id,patient_id,doctor_user_id,scheduled_at,status").eq("branch_id",id).order("scheduled_at",{ascending:false}).limit(200)
  ]);
  for(const r of results)if(r.error)throw r.error;
  setPatients((results[0].data||[]) as Patient[]);setDoctors((results[1].data||[]) as Doctor[]);setAppointments((results[2].data||[]) as Appointment[]);
 }
 useEffect(()=>{let active=true;(async()=>{try{
  const {data:{user}}=await supabase.auth.getUser();if(!user){router.replace("/login");return;}
  const {data:staff,error:se}=await supabase.from("staff_profiles").select("role,branch_id").eq("user_id",user.id).single();if(se)throw new Error("Staff profile is not configured. Ask the administrator.");
  const {data:bs,error:be}=await supabase.from("branches").select("id,name,address").eq("is_active",true).order("name");if(be)throw be;if(!active)return;
  setRole(staff.role);setBranches((bs||[]) as Branch[]);const id=staff.branch_id||(bs?.[0]?.id||"");setBranchId(id);if(id)await loadBranch(id);
 }catch(e){if(active)setError(e instanceof Error?e.message:"Unable to load appointments.");}finally{if(active)setLoading(false);}})();return()=>{active=false;};},[router,supabase]);
 async function changeBranch(id:string){setBranchId(id);setError("");try{await loadBranch(id);}catch(e){setError(e instanceof Error?e.message:"Unable to load branch.");}}
 async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();setSaving(true);setError("");setMessage("");try{
  if(!branchId||!form.patient_id||!form.scheduled_at)throw new Error("Select a patient and appointment date/time.");
  const {error:ie}=await supabase.from("appointments").insert({branch_id:branchId,patient_id:form.patient_id,doctor_user_id:form.doctor_user_id||null,scheduled_at:new Date(form.scheduled_at).toISOString(),notes:form.notes.trim()||null});if(ie)throw ie;
  setForm({patient_id:"",doctor_user_id:"",scheduled_at:"",notes:""});await loadBranch(branchId);setMessage("Appointment saved.");
 }catch(e){setError(e instanceof Error?e.message:"Could not save appointment.");}finally{setSaving(false);}}
 async function updateStatus(id:string,status:string){const {error:e}=await supabase.from("appointments").update({status}).eq("id",id);if(e){setError(e.message);return;}setAppointments(rows=>rows.map(a=>a.id===id?{...a,status}:a));setMessage("Appointment status updated.");}
 async function signOut(){await supabase.auth.signOut();window.location.href="/login";}
 const patientMap=new Map(patients.map(p=>[p.id,p])),doctorMap=new Map(doctors.map(d=>[d.user_id,d]));
 const admin=role==="owner"||role==="admin";
 return <><AppNav/><main className="shell"><header className="top"><div><a className="back-link" href="/">← Dashboard</a><h1>Appointments</h1><p className="muted">Branch bookings, doctor assignment and appointment status</p></div><button className="secondary-btn" onClick={signOut}>Sign out</button></header>
 <div className="toolbar"><label className="field-label">Branch<select value={branchId} disabled={!admin} onChange={e=>changeBranch(e.target.value)}>{branches.map(b=><option key={b.id} value={b.id}>{b.name} — {b.address}</option>)}</select></label></div>
 {error&&<div className="error-box" role="alert">{error}</div>}{message&&<div className="success-box" role="status">{message}</div>}
 <div className="patient-layout"><section className="card"><h2>Book Appointment</h2><form className="patient-form" onSubmit={submit}>
 <label className="field-label full-field">Patient *<select required value={form.patient_id} onChange={e=>setForm({...form,patient_id:e.target.value})}><option value="">Select patient</option>{patients.map(p=><option key={p.id} value={p.id}>{p.full_name}{p.phone?" · "+p.phone:""}</option>)}</select></label>
 <label className="field-label full-field">Doctor<select value={form.doctor_user_id} onChange={e=>setForm({...form,doctor_user_id:e.target.value})}><option value="">Not assigned</option>{doctors.map(d=><option key={d.user_id} value={d.user_id}>{d.full_name}</option>)}</select></label>
 <label className="field-label full-field">Date and time *<input required type="datetime-local" value={form.scheduled_at} onChange={e=>setForm({...form,scheduled_at:e.target.value})}/></label>
 <label className="field-label full-field">Notes<textarea rows={3} value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})}/></label>
 <button className="btn" disabled={saving||loading||!branchId||patients.length===0}>{saving?"Saving…":"Save Appointment"}</button></form>{patients.length===0&&!loading&&<p className="muted">Register a patient before booking.</p>}</section>
 <section className="card"><h2>Appointment Records</h2>{loading?<p className="muted">Loading…</p>:appointments.length===0?<p className="empty-state">No appointments for this branch yet.</p>:<div className="table-wrap"><table className="data-table"><thead><tr><th>Date / Time</th><th>Patient</th><th>Doctor</th><th>Status</th></tr></thead><tbody>{appointments.map(a=><tr key={a.id}><td>{new Date(a.scheduled_at).toLocaleString()}</td><td>{patientMap.get(a.patient_id)?.full_name||"Patient record"}</td><td>{a.doctor_user_id?doctorMap.get(a.doctor_user_id)?.full_name||"Assigned doctor":"Unassigned"}</td><td><select className="status-select" value={a.status} aria-label="Appointment status" onChange={e=>updateStatus(a.id,e.target.value)}>{statuses.map(s=><option key={s} value={s}>{s.replace("_"," ")}</option>)}</select></td></tr>)}</tbody></table></div>}</section></div></main></>;
}
