const modules = [
 ["Branches","Manage clinic locations, addresses and branch-level settings."],
 ["Patients","Patient registration, contact details and visit history."],
 ["Appointments","Reception bookings and appointment status."],
 ["Doctor & Prescriptions","Consultations and digital prescriptions."],
 ["Pharmacy & Billing","Prescription queue, dispensing, invoices and payments."],
 ["Lab","Test requests, results and reports."],
 ["Inventory","Branch-specific medicine and stock movements."],
 ["Online Orders","Website orders and fulfilment queue."],
 ["Customer Support","Appointment enquiries and follow-up requests."],
 ["Staff & Permissions","Role-based access scoped to assigned branches."],
 ["Reports","Branch-wise revenue, visits, stock and activity reports."]
];
export default function Home(){return <main className="shell"><header className="top"><div><div className="pill">Internal clinic operations</div><h1>Homeo Clinics</h1><p className="muted">Awan Homeopathic Clinic · Multi-branch management</p></div><div className="top-actions"><span className="muted">Currency: PKR</span><a className="btn" href="/patients">Open Patients</a></div></header><div className="warning"><b>Setup required:</b> This is the application scaffold. Connect Supabase and configure staff accounts and branch permissions before using it with real patient information.</div><section className="grid"><div className="card"><div className="muted">Branches</div><div className="stat">—</div><p className="muted">Awaiting setup</p></div><div className="card"><div className="muted">Patients</div><div className="stat">—</div><p className="muted">Live database not connected</p></div><div className="card"><div className="muted">Appointments</div><div className="stat">—</div><p className="muted">Live database not connected</p></div><div className="card"><div className="muted">Pending prescriptions</div><div className="stat">—</div><p className="muted">Pharmacy queue not connected</p></div></section><section className="section"><h2>Modules</h2><div className="modules">{modules.map(([name,desc])=><article className="module" key={name}><h3>{name}</h3><p className="muted">{desc}</p></article>)}</div></section></main>}
