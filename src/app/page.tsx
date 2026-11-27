const modules = [
 ["Branches","Manage clinic locations and addresses.","branches"],
 ["Patients","Patient registration and branch-wise records.","patients"],
 ["Appointments","Reception bookings and appointment status.","appointments"],
 ["Doctor & Prescriptions","Consultations and digital prescriptions.","doctor"],
 ["Pharmacy & Billing","Prescription queue, dispensing and invoices.","pharmacy"],
 ["Laboratory","Test requests and result workflow.","lab"],
 ["Medicine Inventory","Branch stock, purchases and low-stock levels.","inventory"],
 ["Online Orders","Website orders and fulfilment.","orders"],
 ["Customer Support","Appointment enquiries and follow-up requests.","support"],
 ["Staff & Permissions","Staff directory and branch-based roles.","staff"],
 ["Reports","Branch-wise revenue, visits, stock and activity.","reports"]
];
export default function Home(){return <main className="shell"><header className="top"><div><div className="pill">Internal clinic operations</div><h1>Homeo Clinics</h1><p className="muted">Awan Homeopathic Clinic · Multi-branch management</p></div><div className="top-actions"><span className="muted">Currency: PKR</span><a className="btn" href="/patients">Patients</a><a className="btn" href="/appointments">Appointments</a></div></header><section className="section"><h2>Clinic Modules</h2><div className="modules">{modules.map(([name,desc,slug])=><a className="module" href={slug==="patients"||slug==="appointments"?"/"+slug:"/operations/"+slug} key={slug} style={{textDecoration:"none",display:"block"}}><h3>{name} →</h3><p className="muted">{desc}</p></a>)}</div></section><section className="section card"><h2>Branch setup</h2><p className="muted">Three clinic branches are registered. Staff members must be assigned to their own branch. Owner/Admin can switch between branches.</p><a className="back-link" href="/operations/branches">View branch directory →</a></section><p className="muted">For internal staff use only · Patient-facing registration is disabled · Currency: PKR</p></main>}
