const modules = [
  ["Patient Records","Registration, patient profiles and branch-wise history","patients","/patients","active"],
  ["Appointments","Bookings, doctor assignment and visit status","appointments","/appointments","active"],
  ["Consultations & Prescriptions","Clinical notes and digital prescriptions","consultations","","planned"],
  ["Pharmacy & Billing","Dispensing, invoices and payment tracking","pharmacy","","planned"],
  ["Laboratory","Test requests, samples and results","lab","","planned"],
  ["Medicine Inventory","Stock levels, transfers and expiry monitoring","inventory","","planned"],
  ["Online Orders","Website orders and fulfilment workflow","orders","","planned"],
  ["Customer Support","Appointment enquiries and follow-up requests","support","","planned"],
  ["Staff & Permissions","Team members, roles and branch access","staff","","planned"],
  ["Reports & Analytics","Branch performance, revenue and activity","reports","","planned"],
  ["Branch Management","Clinic locations and operating details","branches","","planned"]
];

export default function Home() {
  return <main className="shell dashboard-shell">
    <header className="dashboard-heading">
      <div><div className="eyebrow">CLINIC MANAGEMENT WORKSPACE</div><h1>Good day, Clinic Owner</h1><p className="muted">Manage your branches and daily clinic operations from one place.</p></div>
      <div className="heading-meta"><span className="live-pill"><i/> System workspace</span><span className="currency-chip">PKR · Pakistan</span></div>
    </header>
    <section className="welcome-panel">
      <div><span className="panel-kicker">AWAN HOMEOPATHIC CLINIC</span><h2>Everything in one workspace.</h2><p>Use the navigation tabs to move between your active clinic workflows.</p></div>
      <div className="welcome-symbol">HC</div>
    </section>
    <section className="section">
      <div className="section-heading"><div><h2>Clinic modules</h2><p className="muted">Access your operational areas</p></div><span className="module-count">11 MODULES</span></div>
      <div className="modules">{modules.map(([name,desc,slug,href,status],index)=><div className={`module-card ${status === "active" ? "module-ready" : "module-planned"}`} key={slug}>
        <div className="module-card-top"><span className="module-index">{String(index+1).padStart(2,"0")}</span><span className={status === "active" ? "module-state ready" : "module-state"}>{status === "active" ? "Available" : "Coming soon"}</span></div>
        <h3>{name}</h3><p>{desc}</p>
        {status === "active" ? <a className="module-action" href={href}>Open module <span>→</span></a> : <span className="module-disabled">Module not yet available</span>}
      </div>)}</div>
    </section>
    <footer className="dashboard-footer"><span>Awan Homeopathic Clinic</span><span>Internal staff access only · All amounts in PKR</span></footer>
  </main>;
}
