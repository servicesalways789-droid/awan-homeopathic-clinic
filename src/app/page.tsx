import Link from "next/link";
import AppNav from "@/components/AppNav";

const shortcuts = [
  { title:"Register a patient", description:"Create a patient profile and keep their clinic record organised.", href:"/patients", action:"Add new patient", icon:"＋", tone:"blue" },
  { title:"Manage appointments", description:"Schedule visits, assign doctors and update appointment status.", href:"/appointments", action:"View appointments", icon:"▦", tone:"violet" },
  { title:"E-commerce & online orders", description:"Manage products, customer orders and delivery status by branch.", href:"/online-orders", action:"Open order desk", icon:"🛒", tone:"teal" },
];
const planned = [
  ["Doctor Workspace","Consultations and digital prescriptions","01"],
  ["Pharmacy & Billing","Dispensing, invoices and payments","02"],
  ["Medicine Inventory","Stock levels, expiry and movements","03"],
  ["Laboratory","Test requests and result tracking","04"],
  ["E-commerce & Online Orders","Product catalogue and order fulfilment","05"],
  ["Customer Support","Appointment enquiries and follow-ups","06"],
  ["Branch Management","Clinic locations and operations","07"],
  ["Staff & Permissions","Team access and role management","08"],
  ["Reports & Analytics","Business and branch performance","09"],
];
export default function Home() {
 return <><AppNav/><div className="workspace-main">
  <header className="workspace-topbar"><div className="breadcrumb">Workspace <span>/</span> <strong>Overview</strong></div><div className="topbar-right"><span className="topbar-status"><i/> System workspace</span><span className="topbar-divider"/><span className="topbar-currency">PKR</span><span className="topbar-user">CO</span></div></header>
  <main className="dashboard-content">
   <section className="welcome-heading"><div><div className="page-eyebrow">AWAN HOMEOPATHIC CLINIC</div><h1>Clinic overview</h1><p>Your central workspace for managing daily clinic operations.</p></div><div className="today-chip"><span className="today-icon">◷</span><span><strong>Pakistan Standard Time</strong><small>PKR · Pakistan</small></span></div></section>
   <section className="hero-workspace"><div className="hero-copy"><span className="hero-label">WELCOME TO YOUR WORKSPACE</span><h2>Everything your clinic needs,<br/>in one organised place.</h2><p>Manage patient records and appointments across your clinic branches.</p><div className="hero-actions"><Link href="/patients" className="hero-primary">Register a patient <span>→</span></Link><Link href="/appointments" className="hero-secondary">Open appointments</Link></div></div><div className="hero-art" aria-hidden="true"><div className="hero-orbit orbit-one"/><div className="hero-orbit orbit-two"/><div className="hero-cross">+</div><div className="hero-art-card"><span>HC</span><small>CLINIC CARE</small></div></div></section>
   <section className="dashboard-section"><div className="dashboard-section-head"><div><h2>Quick actions</h2><p>Common tasks to get your day started</p></div><span className="section-count">03 AVAILABLE</span></div><div className="quick-action-grid">{shortcuts.map(item=><Link href={item.href} key={item.title} className="quick-action-card"><span className={`quick-action-icon ${item.tone}`}>{item.icon}</span><span className="quick-action-copy"><strong>{item.title}</strong><small>{item.description}</small><em>{item.action} <b>→</b></em></span><span className="quick-card-arrow">↗</span></Link>)}</div></section>
   <section className="dashboard-section modules-section"><div className="dashboard-section-head"><div><h2>Clinic modules</h2><p>All departments in one workspace</p></div><span className="section-count">11 MODULES</span></div><div className="module-directory">{planned.map(([name,desc,num])=><div className="directory-item" key={name}><span className="directory-number">{num}</span><span className="directory-copy"><strong>{name}</strong><small>{desc}</small></span><span className="directory-status">{name==="E-commerce & Online Orders"?"Available":"In setup"}</span></div>)}</div><p className="module-note">Additional modules will become available as their workflows are completed and tested.</p></section>
   <footer className="workspace-footer"><span>© Awan Homeopathic Clinic</span><span>Private staff workspace <i/> Secure access</span></footer>
  </main>
 </div></>;
}
