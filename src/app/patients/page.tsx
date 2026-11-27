"use client";
import {FormEvent,useEffect,useMemo,useState} from "react";
import {useRouter} from "next/navigation";
import {createClient} from "@/lib/supabase/client";
import AppNav from "@/components/AppNav";
type Branch={id:string;name:string;address:string};
type Patient={id:string;patient_code:string|null;full_name:string;phone:string|null;date_of_birth:string|null;sex:string|null;address:string|null;created_at:string};
type Profile={role:string;branch_id:string|null};
function branchInfo(address:string){const a=address.toLowerCase();if(a.includes("pabbi"))return {label:"Pabbi Branch",tone:"blue"};if(a.includes("dabgari"))return {label:"Dabgari Branch",tone:"violet"};return {label:"Kohat Road Branch",tone:"teal"};}
export default function PatientsPage(){
 const router=useRouter(),supabase=useMemo(()=>createClient(),[]);
 const [branches,setBranches]=useState<Branch[]>([]),[patients,setPatients]=useState<Patient[]>([]),[branchId,setBranchId]=useState(""),[profile,setProfile]=useState<Profile|null>(null),[search,setSearch]=useState("");
 const [loading,setLoading]=useState(true),[saving,setSaving]=useState(false),[error,setError]=useState(""),[success,setSuccess]=useState("");
 const [form,setForm]=useState({full_name:"",phone:"",date_of_birth:"",sex:"",address:"",notes:""});
 const isGlobalAdmin=profile?.role==="owner"||profile?.role==="admin";
 async function loadPatients(selectedBranch=branchId){if(!selectedBranch){setPatients([]);return;}const {data,error}=await supabase.from("patients").select("id,patient_code,full_name,phone,date_of_birth,sex,address,created_at").eq("branch_id",selectedBranch).order("created_at",{ascending:false}).limit(200);if(error)throw error;setPatients((data||[]) as Patient[]);}
 useEffect(()=>{let active=true;async function init(){try{const {data:auth}=await supabase.auth.getUser();if(!auth.user){router.replace("/login");return;}
  const {data:staff,error:staffError}=await supabase.from("staff_profiles").select("role,branch_id").eq("user_id",auth.user.id).single();if(staffError)throw new Error("Your staff profile is not configured. Ask the system administrator to assign your role and branch.");
  const p=staff as Profile;const {data:branchRows,error:branchError}=await supabase.from("branches").select("id,name,address").eq("is_active",true).order("address");if(branchError)throw branchError;if(!active)return;
  setProfile(p);setBranches((branchRows||[]) as Branch[]);const initial=p.branch_id||(branchRows?.[0]?.id??"");setBranchId(initial);if(initial){const {data,error}=await supabase.from("patients").select("id,patient_code,full_name,phone,date_of_birth,sex,address,created_at").eq("branch_id",initial).order("created_at",{ascending:false}).limit(200);if(error)throw error;if(active)setPatients((data||[]) as Patient[]);}
 }catch(e){if(active)setError(e instanceof Error?e.message:"Unable to load patients.");}finally{if(active)setLoading(false);}}init();return()=>{active=false;};},[router,supabase]);
 async function changeBranch(id:string){setBranchId(id);setError("");try{await loadPatients(id);}catch(e){setError(e instanceof Error?e.message:"Unable to load this branch.");}}
 async function addPatient(e:FormEvent<HTMLFormElement>){e.preventDefault();setSaving(true);setError("");setSuccess("");try{if(!branchId)throw new Error("Select a branch first.");
  const {error}=await supabase.from("patients").insert({branch_id:branchId,full_name:form.full_name.trim(),phone:form.phone.trim()||null,date_of_birth:form.date_of_birth||null,sex:form.sex||null,address:form.address.trim()||null,notes:form.notes.trim()||null});if(error)throw error;
  setForm({full_name:"",phone:"",date_of_birth:"",sex:"",address:"",notes:""});await loadPatients(branchId);setSuccess("Patient registered successfully.");
 }catch(e){setError(e instanceof Error?e.message:"Could not register patient.");}finally{setSaving(false);}}
 const filtered=patients.filter(p=>[p.full_name,p.phone||"",p.patient_code||""].join(" ").toLowerCase().includes(search.toLowerCase()));
 async function signOut(){await supabase.auth.signOut();window.location.href="/login";}
 const selected=branches.find(b=>b.id===branchId),info=selected?branchInfo(selected.address):null;
 return <><AppNav/><main className="workspace-main"><header className="workspace-topbar"><div className="breadcrumb">Workspace <span>/</span><strong>Patient records</strong></div><div className="topbar-right"><span className="topbar-status"><i/> Staff workspace</span><button className="workspace-signout" onClick={signOut}>Sign out</button></div></header>
 <div className="module-content"><section className="module-page-heading"><div><div className="page-eyebrow">PATIENT CARE & RECORDS</div><h1>Patient records</h1><p>Register patients and find existing clinic records.</p></div><div className="branch-picker"><label htmlFor="patient-branch">Clinic location</label><select id="patient-branch" value={branchId} onChange={e=>changeBranch(e.target.value)} disabled={!isGlobalAdmin}>{branches.map(b=>{const bi=branchInfo(b.address);return <option key={b.id} value={b.id}>{bi.label} · {b.address}</option>;})}</select>{info&&<span className={`branch-color-tag ${info.tone}`}>{info.label}</span>}</div></section>
 <div className="patient-toolbar"><label className="search-control"><span>⌕</span><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by patient name, phone or ID"/></label><span className="record-count">{filtered.length} records</span></div>
 {error&&<div className="error-box" role="alert">{error}</div>}{success&&<div className="success-box" role="status">{success}</div>}
 <div className="module-work-grid patient-work-grid"><section className="module-panel booking-panel"><div className="panel-heading"><span className="panel-icon blue">＋</span><div><h2>Register a patient</h2><p>Add a new patient to this branch</p></div></div><form onSubmit={addPatient} className="patient-form">
 <label className="field-label full-field">Full name *<input required maxLength={120} value={form.full_name} onChange={e=>setForm({...form,full_name:e.target.value})}/></label>
 <label className="field-label full-field">Phone number<input maxLength={30} value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/></label>
 <label className="field-label">Date of birth<input type="date" value={form.date_of_birth} onChange={e=>setForm({...form,date_of_birth:e.target.value})}/></label>
 <label className="field-label">Sex<select value={form.sex} onChange={e=>setForm({...form,sex:e.target.value})}><option value="">Not specified</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></select></label>
 <label className="field-label full-field">Address<input maxLength={300} value={form.address} onChange={e=>setForm({...form,address:e.target.value})}/></label>
 <label className="field-label full-field">Notes<textarea rows={3} maxLength={2000} value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})}/></label>
 <button className="btn" disabled={saving||loading||!branchId}>{saving?"Saving…":"Save patient record"}</button></form></section>
 <section className="module-panel records-panel"><div className="panel-heading"><span className="panel-icon teal">◎</span><div><h2>Patient directory</h2><p>{filtered.length} patients · newest records first</p></div></div>{loading?<p className="empty-state">Loading patient records…</p>:filtered.length===0?<div className="empty-state"><span className="empty-symbol">◎</span><strong>No patient records found</strong><span>New registrations for this location will appear here.</span></div>:<div className="table-wrap"><table className="data-table"><thead><tr><th>Patient</th><th>Phone</th><th>Date of birth</th><th>Sex</th><th>Registered</th></tr></thead><tbody>{filtered.map(p=><tr key={p.id}><td><strong>{p.full_name}</strong>{p.patient_code&&<small>{p.patient_code}</small>}</td><td>{p.phone||"—"}</td><td>{p.date_of_birth||"—"}</td><td>{p.sex||"—"}</td><td>{new Date(p.created_at).toLocaleDateString()}</td></tr>)}</tbody></table></div>}</section></div>
 <footer className="workspace-footer"><span>Awan Homeopathic Clinic</span><span>Patient records · PKR</span></footer></div></main></>;
}
