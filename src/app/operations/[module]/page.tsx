"use client";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Branch={id:string;name:string;address:string};
type Profile={role:string;branch_id:string|null;full_name?:string};
type Row=Record<string,any>;
const titles:Record<string,string>={pharmacy:"Pharmacy & Billing",inventory:"Medicine Inventory",lab:"Laboratory",orders:"Online Orders",support:"Customer Support",doctor:"Doctor Workspace",branches:"Branches",staff:"Staff & Permissions",reports:"Reports"};
const money=(n:number)=>new Intl.NumberFormat("en-PK",{style:"currency",currency:"PKR",maximumFractionDigits:2}).format(n||0);

export default function OperationsPage(){
 const params=useParams<{module:string}>(), module=params.module;
 const router=useRouter(), supabase=useMemo(()=>createClient(),[]);
 const [branches,setBranches]=useState<Branch[]>([]),[branchId,setBranchId]=useState("");
 const [profile,setProfile]=useState<Profile|null>(null),[rows,setRows]=useState<Row[]>([]),[patients,setPatients]=useState<Row[]>([]);
 const [loading,setLoading]=useState(true),[saving,setSaving]=useState(false),[error,setError]=useState(""),[notice,setNotice]=useState("");
 const [form,setForm]=useState<Record<string,string>>({});
 const globalAdmin=profile?.role==="owner"||profile?.role==="admin";
 const allowed:Record<string,string[]>={pharmacy:["pharmacist","general_manager"],inventory:["pharmacist","general_manager"],lab:["lab_staff","doctor","general_manager"],orders:["order_staff","general_manager"],support:["customer_support","reception","general_manager"],doctor:["doctor","general_manager"],branches:["general_manager","doctor","pharmacist","reception","customer_support","order_staff","lab_staff"],staff:["general_manager"],reports:["general_manager"]};
 const canUse=!!profile && (globalAdmin || (profile.branch_id===branchId && (allowed[module]||[]).includes(profile.role)));
 useEffect(()=>{if(!titles[module])router.replace("/");},[module,router]);

 async function loadData(id:string,mod=module){
  if(!id){setRows([]);setPatients([]);return;}
  if(["pharmacy","lab","support","doctor"].includes(mod)){const {data:patientData,error:patientError}=await supabase.from("patients").select("id,full_name,phone").eq("branch_id",id).order("full_name").limit(1000);if(patientError)throw patientError;setPatients((patientData||[]) as Row[]);}else{setPatients([]);}
  let q:any;
  if(mod==="pharmacy") q=supabase.from("prescriptions").select("id,patient_id,status,created_at,patients(full_name,phone),prescription_items(id,medicine_name,dosage,frequency,duration,quantity,instructions)").eq("branch_id",id).order("created_at",{ascending:false}).limit(100);
  else if(mod==="inventory") q=supabase.from("medicines").select("id,name,sku,unit,unit_price,reorder_level,is_active,stock_movements(quantity,movement_type)").eq("branch_id",id).order("name");
  else if(mod==="lab") q=supabase.from("lab_orders").select("id,patient_id,test_name,status,result_notes,created_at,patients(full_name,phone)").eq("branch_id",id).order("created_at",{ascending:false}).limit(200);
  else if(mod==="orders") q=supabase.from("website_orders").select("*").eq("branch_id",id).order("created_at",{ascending:false}).limit(200);
  else if(mod==="support") q=supabase.from("support_requests").select("*,patients(full_name)").eq("branch_id",id).order("created_at",{ascending:false}).limit(200);
  else if(mod==="doctor") q=supabase.from("appointments").select("id,patient_id,doctor_user_id,scheduled_at,status,patients(full_name,phone)").eq("branch_id",id).order("scheduled_at",{ascending:false}).limit(200);
  else if(mod==="branches") q=supabase.from("branches").select("id,name,address,phone,is_active").order("name");
  else if(mod==="staff") q=supabase.from("staff_profiles").select("user_id,full_name,role,branch_id,is_active,branches(name,address)").order("full_name");
  else if(mod==="reports"){
   const [p,a,i,l,o]=await Promise.all([
    supabase.from("patients").select("id",{count:"exact",head:true}).eq("branch_id",id),
    supabase.from("appointments").select("id",{count:"exact",head:true}).eq("branch_id",id),
    supabase.from("pharmacy_invoices").select("total,payment_status,created_at").eq("branch_id",id),
    supabase.from("lab_orders").select("id",{count:"exact",head:true}).eq("branch_id",id),
    supabase.from("website_orders").select("id",{count:"exact",head:true}).eq("branch_id",id)
   ]);
   for(const x of [p,a,i,l,o])if(x.error)throw x.error;
   const invoices=(i.data||[]) as Row[];
   setRows([{label:"Patients",value:p.count||0},{label:"Appointments",value:a.count||0},{label:"Lab orders",value:l.count||0},{label:"Online orders",value:o.count||0},{label:"Invoice revenue",value:invoices.reduce((s,x)=>s+Number(x.total||0),0)},{label:"Unpaid invoices",value:invoices.filter(x=>x.payment_status!=="paid").length}]);return;
  }
  else q=null;
  if(!q){setRows([]);return;}
  const {data,error:e}=await q;if(e)throw e;setRows((data||[]) as Row[]);
 }
 useEffect(()=>{let alive=true;(async()=>{try{
  const {data:{user}}=await supabase.auth.getUser();if(!user){router.replace("/login");return;}
  const {data:s,error:se}=await supabase.from("staff_profiles").select("role,branch_id,full_name").eq("user_id",user.id).single();if(se)throw new Error("Staff profile is not configured. Ask the clinic owner to assign your role.");
  const {data:b,error:be}=await supabase.from("branches").select("id,name,address").eq("is_active",true).order("name");if(be)throw be;if(!alive)return;
  setProfile(s as Profile);setBranches((b||[]) as Branch[]);
  const id=s.branch_id||(b?.[0]?.id||"");setBranchId(id);if(id)await loadData(id);
 }catch(e){if(alive)setError(e instanceof Error?e.message:"Could not load this module.");}finally{if(alive)setLoading(false);}})();return()=>{alive=false;};},[router,supabase,module]);

 async function changeBranch(id:string){setBranchId(id);setError("");try{await loadData(id);}catch(e){setError(e instanceof Error?e.message:"Could not load branch data.");}}
 async function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();setSaving(true);setError("");setNotice("");
  try{
   let table="",payload:Row={branch_id:branchId};
   if(module==="inventory"){
    if(form.action==="medicine"){table="medicines";payload={...payload,name:form.name.trim(),sku:form.sku.trim()||null,unit:form.unit||"unit",unit_price:Number(form.unit_price||0),reorder_level:Number(form.reorder_level||0)};}
    else {table="stock_movements";payload={...payload,medicine_id:form.medicine_id,movement_type:form.movement_type,quantity:Number(form.quantity),unit_cost:Number(form.unit_cost||0),notes:form.notes||null};}
   } else if(module==="lab"){table="lab_orders";payload={...payload,patient_id:form.patient_id,test_name:form.test_name.trim()};}
   else if(module==="orders"){table="website_orders";payload={...payload,customer_name:form.customer_name.trim(),customer_phone:form.customer_phone.trim(),delivery_address:form.delivery_address||null,items:form.items.split("\n").filter(Boolean).map(x=>({item:x.trim()})),total:Number(form.total||0),notes:form.notes||null};}
   else if(module==="support"){table="support_requests";payload={...payload,patient_id:form.patient_id||null,customer_name:form.customer_name.trim(),phone:form.phone.trim(),request_type:form.request_type||"appointment",notes:form.notes||null};}
   else if(module==="doctor"){
    const {data:{user}}=await supabase.auth.getUser();if(!user)throw new Error("Please sign in again.");
    const {data:rx,error:re}=await supabase.from("prescriptions").insert({branch_id:branchId,patient_id:form.patient_id,doctor_user_id:user.id,appointment_id:form.appointment_id||null,clinical_notes:form.clinical_notes||null,status:"sent_to_pharmacy"}).select("id").single();if(re)throw re;
    const items=form.medicines.split("\n").map(x=>x.trim()).filter(Boolean).map(line=>{const [medicine_name,dosage,frequency,duration,quantity]=line.split("|").map(v=>v?.trim());return {prescription_id:rx.id,medicine_name,dosage:dosage||null,frequency:frequency||null,duration:duration||null,quantity:quantity?Number(quantity):1};});
    if(items.length){const {error:ie}=await supabase.from("prescription_items").insert(items);if(ie)throw ie;}
    setNotice("Prescription sent to the branch pharmacy queue.");setForm({});await loadData(branchId);return;
   }
   const {error:e2}=await supabase.from(table).insert(payload);if(e2)throw e2;
   setForm({});await loadData(branchId);setNotice("Record saved successfully.");
  }catch(e){setError(e instanceof Error?e.message:"Could not save record.");}finally{setSaving(false);}
 }
 async function changeStatus(table:string,id:string,field:string,value:string){
  setError("");const {error:e}=await supabase.from(table).update({[field]:value}).eq("id",id);if(e){setError(e.message);return;}
  setRows(old=>old.map(r=>r.id===id?{...r,[field]:value}:r));setNotice("Status updated.");
 }
 async function createInvoice(rx:Row){
  const amount=window.prompt("Enter total bill amount in PKR");if(amount===null)return;
  const total=Number(amount);if(!Number.isFinite(total)||total<0){setError("Enter a valid amount.");return;}
  setError("");try{
   const {data:inv,error:e}=await supabase.from("pharmacy_invoices").insert({branch_id:branchId,patient_id:rx.patient_id,prescription_id:rx.id,subtotal:total,total,discount:0,payment_status:"unpaid"}).select("id").single();if(e)throw e;
   const {error:lineError}=await supabase.from("invoice_items").insert({invoice_id:inv.id,medicine_name:"Prescription medicines",quantity:1,unit_price:total,line_total:total});if(lineError)throw lineError;
   const {error:se}=await supabase.from("prescriptions").update({status:"dispensed"}).eq("id",rx.id);if(se)throw se;
   setNotice("Invoice "+inv.id.slice(0,8)+" created. Total: "+money(total));await loadData(branchId);
  }catch(e){setError(e instanceof Error?e.message:"Could not create invoice.");}
 }
 async function signOut(){await supabase.auth.signOut();window.location.href="/login";}
 const field=(name:string,label:string,type="text",required=true)=><label className="field-label">{label}<input required={required} type={type} value={form[name]||""} onChange={e=>setForm({...form,[name]:e.target.value})}/></label>;
 const select=(name:string,label:string,options:string[],required=true)=><label className="field-label">{label}<select required={required} value={form[name]||""} onChange={e=>setForm({...form,[name]:e.target.value})}><option value="">Select…</option>{options.map(x=><option key={x} value={x}>{x.replaceAll("_"," ")}</option>)}</select></label>;
 const patientOptions=patients;
 const title=titles[module]||"Operations";
 return <main className="shell"><header className="top"><div><a className="back-link" href="/">← Dashboard</a><h1>{title}</h1><p className="muted">Awan Homeopathic Clinic · Branch operations · PKR</p></div><button className="secondary-btn" onClick={signOut}>Sign out</button></header>
 <div className="toolbar"><label className="field-label">Branch<select value={branchId} disabled={!globalAdmin} onChange={e=>changeBranch(e.target.value)}>{branches.map(b=><option key={b.id} value={b.id}>{b.name} — {b.address}</option>)}</select></label></div>
 {error&&<div className="error-box" role="alert">{error}</div>}{notice&&<div className="success-box" role="status">{notice}</div>}
 {loading?<div className="card">Loading module…</div>:!canUse?<div className="warning">Your staff role does not have access to this module or branch. Contact the clinic owner.</div>:<div className="patient-layout">
 <section className="card"><h2>{module==="inventory"?"Add medicine / stock":module==="lab"?"New lab test":module==="orders"?"Enter website order":module==="support"?"New support request":module==="doctor"?"Create prescription":module==="pharmacy"?"Pharmacy workflow":module==="branches"?"Branch directory":module==="staff"?"Staff directory": "Branch summary"}</h2>
 {module==="inventory"&&<form className="patient-form" onSubmit={submit}><input type="hidden" value={form.action||"medicine"}/>{select("action","Action",["medicine","stock"])}{form.action==="stock"?<>{select("medicine_id","Medicine",rows.map(r=>r.id))}{select("movement_type","Movement type",["opening","purchase","dispense","adjustment","return","damage"])}{field("quantity","Quantity","number")}{field("unit_cost","Unit cost (PKR)","number",false)}{field("notes","Notes","text",false)}</>:<>{field("name","Medicine name")}{field("sku","SKU", "text",false)}{field("unit","Unit", "text",false)}{field("unit_price","Selling price (PKR)","number",false)}{field("reorder_level","Reorder level","number",false)}</>}<button className="btn" disabled={saving}>{saving?"Saving…":"Save"}</button></form>}
 {module==="lab"&&<form className="patient-form" onSubmit={submit}><label className="field-label full-field">Patient<select required value={form.patient_id||""} onChange={e=>setForm({...form,patient_id:e.target.value})}><option value="">Select patient…</option>{patientOptions.map(p=><option key={p.id} value={p.id}>{p.full_name}{p.phone?" · "+p.phone:""}</option>)}</select></label>{field("test_name","Test name")}<button className="btn" disabled={saving}>Create lab order</button></form>}
 {module==="orders"&&<form className="patient-form" onSubmit={submit}>{field("customer_name","Customer name")}{field("customer_phone","Phone")}{field("delivery_address","Delivery address","text",false)}<label className="field-label full-field">Order items (one per line)<textarea required rows={4} value={form.items||""} onChange={e=>setForm({...form,items:e.target.value})}/></label>{field("total","Total (PKR)","number")}<label className="field-label full-field">Notes<textarea rows={2} value={form.notes||""} onChange={e=>setForm({...form,notes:e.target.value})}/></label><button className="btn" disabled={saving}>Save order</button></form>}
 {module==="support"&&<form className="patient-form" onSubmit={submit}>{field("customer_name","Customer name")}{field("phone","Phone")}{select("request_type","Request type",["appointment","follow_up","general_enquiry","complaint"])}<label className="field-label full-field">Linked patient (optional)<select value={form.patient_id||""} onChange={e=>setForm({...form,patient_id:e.target.value})}><option value="">No linked patient</option>{patientOptions.map(p=><option key={p.id} value={p.id}>{p.full_name}{p.phone?" · "+p.phone:""}</option>)}</select></label><label className="field-label full-field">Notes<textarea rows={3} value={form.notes||""} onChange={e=>setForm({...form,notes:e.target.value})}/></label><button className="btn" disabled={saving}>Save request</button></form>}
 {module==="doctor"&&<form className="patient-form" onSubmit={submit}><label className="field-label full-field">Patient<select required value={form.patient_id||""} onChange={e=>setForm({...form,patient_id:e.target.value})}><option value="">Select patient…</option>{patientOptions.map(p=><option key={p.id} value={p.id}>{p.full_name}{p.phone?" · "+p.phone:""}</option>)}</select></label>{field("appointment_id","Appointment ID (optional)","text",false)}<label className="field-label full-field">Clinical notes<textarea rows={3} value={form.clinical_notes||""} onChange={e=>setForm({...form,clinical_notes:e.target.value})}/></label><label className="field-label full-field">Medicines (one per line: name | dosage | frequency | duration | quantity)<textarea required rows={5} value={form.medicines||""} onChange={e=>setForm({...form,medicines:e.target.value})}/></label><button className="btn" disabled={saving}>Send prescription to pharmacy</button></form>}
 {module==="pharmacy"&&<p className="muted">Open a prescription in the queue and create its bill. Prescription details are already entered by the doctor.</p>}
 {module==="branches"&&<p className="muted">All registered clinic locations are shown on the right.</p>}
 {module==="staff"&&<p className="muted">Staff access is controlled by role and assigned branch. Create authentication accounts through the secured owner setup process; never share staff passwords.</p>}
 {module==="reports"&&<p className="muted">Summary totals for the selected branch.</p>}
 </section>
 <section className="card"><h2>{module==="pharmacy"?"Prescription queue":module==="inventory"?"Medicine stock":module==="lab"?"Lab orders":module==="orders"?"Website orders":module==="support"?"Support requests":module==="doctor"?"Appointments":module==="branches"?"Clinic locations":module==="staff"?"Registered staff":"Branch performance"}</h2>
 {rows.length===0?<p className="empty-state">No records found.</p>:<div className="table-wrap">
 {module==="inventory"?<table className="data-table"><thead><tr><th>Medicine</th><th>SKU</th><th>Available</th><th>Price</th><th>Reorder at</th></tr></thead><tbody>{rows.map(r=>{const stock=(r.stock_movements||[]).reduce((n:number,m:Row)=>n+(["opening","purchase","return"].includes(m.movement_type)?1:-1)*Number(m.quantity),0);return <tr key={r.id}><td>{r.name}</td><td>{r.sku||"—"}</td><td>{stock} {r.unit}</td><td>{money(Number(r.unit_price))}</td><td>{r.reorder_level}</td></tr>})}</tbody></table>
 :module==="pharmacy"?<table className="data-table"><thead><tr><th>Patient</th><th>Prescription</th><th>Medicines</th><th>Status</th><th>Action</th></tr></thead><tbody>{rows.map(r=><tr key={r.id}><td>{r.patients?.full_name||r.patient_id}</td><td>{r.id.slice(0,8)}<small>{new Date(r.created_at).toLocaleDateString()}</small></td><td>{(r.prescription_items||[]).map((i:Row)=>i.medicine_name+" ("+(i.dosage||"")+")").join(", ")||"No items"}</td><td>{r.status}</td><td>{r.status==="sent_to_pharmacy"?<button className="secondary-btn" onClick={()=>createInvoice(r)}>Create bill</button>:"—"}</td></tr>)}</tbody></table>
 :module==="lab"?<table className="data-table"><thead><tr><th>Patient</th><th>Test</th><th>Date</th><th>Status</th></tr></thead><tbody>{rows.map(r=><tr key={r.id}><td>{r.patients?.full_name||r.patient_id}</td><td>{r.test_name}</td><td>{new Date(r.created_at).toLocaleDateString()}</td><td><select className="status-select" value={r.status} onChange={e=>changeStatus("lab_orders",r.id,"status",e.target.value)}>{["pending","sample_collected","completed","cancelled"].map(s=><option key={s}>{s}</option>)}</select></td></tr>)}</tbody></table>
 :module==="orders"?<table className="data-table"><thead><tr><th>Customer</th><th>Phone</th><th>Total</th><th>Status</th><th>Created</th></tr></thead><tbody>{rows.map(r=><tr key={r.id}><td>{r.customer_name}</td><td>{r.customer_phone}</td><td>{money(Number(r.total))}</td><td><select className="status-select" value={r.status} onChange={e=>changeStatus("website_orders",r.id,"status",e.target.value)}>{["new","confirmed","packed","dispatched","delivered","cancelled"].map(s=><option key={s}>{s}</option>)}</select></td><td>{new Date(r.created_at).toLocaleDateString()}</td></tr>)}</tbody></table>
 :module==="support"?<table className="data-table"><thead><tr><th>Customer</th><th>Phone</th><th>Request</th><th>Status</th></tr></thead><tbody>{rows.map(r=><tr key={r.id}><td>{r.customer_name}</td><td>{r.phone}</td><td>{r.request_type}</td><td><select className="status-select" value={r.status} onChange={e=>changeStatus("support_requests",r.id,"status",e.target.value)}>{["open","contacted","scheduled","closed"].map(s=><option key={s}>{s}</option>)}</select></td></tr>)}</tbody></table>
 :module==="doctor"?<table className="data-table"><thead><tr><th>Appointment</th><th>Patient</th><th>Phone</th><th>Status</th></tr></thead><tbody>{rows.map(r=><tr key={r.id}><td>{new Date(r.scheduled_at).toLocaleString()}</td><td>{r.patients?.full_name||r.patient_id}</td><td>{r.patients?.phone||"—"}</td><td>{r.status}</td></tr>)}</tbody></table>
 :module==="branches"?<table className="data-table"><thead><tr><th>Clinic</th><th>Address</th><th>Phone</th><th>Active</th></tr></thead><tbody>{rows.map(r=><tr key={r.id}><td>{r.name}</td><td>{r.address}</td><td>{r.phone||"—"}</td><td>{r.is_active?"Yes":"No"}</td></tr>)}</tbody></table>
 :module==="staff"?<table className="data-table"><thead><tr><th>Name</th><th>Role</th><th>Branch</th><th>Active</th></tr></thead><tbody>{rows.map(r=><tr key={r.user_id}><td>{r.full_name}</td><td>{r.role}</td><td>{r.branches?.address||"All branches"}</td><td>{r.is_active?"Yes":"No"}</td></tr>)}</tbody></table>
 :<table className="data-table"><thead><tr><th>Metric</th><th>Value</th></tr></thead><tbody>{rows.map(r=><tr key={r.label}><td>{r.label}</td><td>{r.label==="Invoice revenue"?money(r.value):r.value}</td></tr>)}</tbody></table>}
 </div>}
 </section></div>}
 </main>;
}
