"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { label: "Overview", href: "/", icon: "overview", active: true },
  { label: "Patient Records", href: "/patients", icon: "patients", active: true },
  { label: "Appointments", href: "/appointments", icon: "calendar", active: true },
  { label: "Doctor Workspace", icon: "doctor" },
  { label: "Pharmacy & Billing", icon: "pharmacy" },
  { label: "Medicine Inventory", icon: "inventory" },
  { label: "Laboratory", icon: "lab" },
  { label: "E-commerce & Online Orders", href: "/online-orders", icon: "orders", active: true },
  { label: "Customer Support", icon: "support" },
  { label: "Branch Management", icon: "branches" },
  { label: "Staff & Permissions", icon: "staff" },
  { label: "Reports & Analytics", icon: "reports" },
];

function Icon({name}:{name:string}) {
  const paths:Record<string,React.ReactNode> = {
    overview:<><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></>,
    patients:<><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="10" cy="7" r="4"/><path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></>,
    calendar:<><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18"/></>,
    doctor:<><path d="M8 3v5a4 4 0 0 0 8 0V3M5 3h6M13 3h6M12 12v3a5 5 0 0 0 10 0v-1"/><circle cx="22" cy="11" r="1"/></>,
    pharmacy:<><path d="m4 4 16 16M20 4 4 20"/><rect x="3" y="3" width="18" height="18" rx="5"/></>,
    inventory:<><path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5M3 16l9 5 9-5"/></>,
    lab:<><path d="M9 3h6M10 3v7l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3M8 15h8"/></>,
    orders:<><path d="M3 4h2l2.4 11.4a2 2 0 0 0 2 1.6h8.8a2 2 0 0 0 2-1.6L22 8H6"/><circle cx="10" cy="21" r="1"/><circle cx="18" cy="21" r="1"/></>,
    support:<><path d="M4 14v-3a8 8 0 0 1 16 0v3"/><path d="M4 14h3v6H6a2 2 0 0 1-2-2v-4ZM20 14h-3v6h1a2 2 0 0 0 2-2v-4ZM12 21h3"/></>,
    branches:<><path d="M3 21h18M5 21V7l7-4 7 4v14M9 10h1M14 10h1M9 14h1M14 14h1M10 21v-3h4v3"/></>,
    staff:<><circle cx="9" cy="8" r="3"/><path d="M3 21v-2a6 6 0 0 1 12 0v2M16 5a3 3 0 0 1 0 6M18 15a5 5 0 0 1 3 4v2"/></>,
    reports:<><path d="M4 19V5M4 19h17"/><path d="m7 15 4-4 3 2 6-7"/></>,
  };
  return <svg viewBox="0 0 24 24" aria-hidden="true" className="side-icon" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}
export default function AppNav() {
  const pathname=usePathname();
  const [mobileOpen,setMobileOpen]=useState(false);
  return <>
    <aside className={`clinic-sidebar${mobileOpen?" sidebar-open":""}`}>
      <Link href="/" className="sidebar-brand" onClick={()=>setMobileOpen(false)}>
        <span className="sidebar-logo">HC</span><span><strong>Homeo Clinics</strong><small>MANAGEMENT SYSTEM</small></span>
      </Link>
      <div className="sidebar-branch"><span className="branch-avatar">A</span><span><strong>Clinic locations</strong><small>3 registered branches</small></span><span className="branch-chevron">⌄</span></div>
      <div className="sidebar-caption">WORKSPACE</div>
      <nav className="sidebar-links" aria-label="Clinic workspace navigation">
        {links.slice(0,3).map(item=>{const active=item.href==="/" ? pathname==="/" : pathname.startsWith(item.href!);return <Link key={item.label} href={item.href!} className={`sidebar-link menu-${item.icon}${active?" selected":""}`} aria-current={active?"page":undefined} onClick={()=>setMobileOpen(false)}><Icon name={item.icon}/><span>{item.label}</span>{active&&<i className="active-rail"/>}</Link>;})}
      </nav>
      <div className="sidebar-caption modules-caption">CLINIC OPERATIONS</div>
      <nav className="sidebar-links" aria-label="Clinic modules">
        {links.slice(3).map(item=>item.href?<Link key={item.label} href={item.href} className={`sidebar-link menu-${item.icon}${pathname.startsWith(item.href)?" selected":""}`} aria-current={pathname.startsWith(item.href)?"page":undefined} onClick={()=>setMobileOpen(false)}><Icon name={item.icon}/><span>{item.label}</span>{pathname.startsWith(item.href)&&<i className="active-rail"/>}</Link>:<div key={item.label} className={`sidebar-link disabled-link menu-${item.icon}`} aria-disabled="true" title="This module is not available yet"><Icon name={item.icon}/><span>{item.label}</span><span className="soon-dot"/></div>)}
      </nav>
      <div className="sidebar-bottom"><div className="sidebar-secure"><span className="secure-check">✓</span><span><strong>Secure workspace</strong><small>Staff access only</small></span></div><div className="sidebar-version">HOMEo CLINICS <span>·</span> PKR</div></div>
    </aside>
    <div className="mobile-sidebar-bar"><button type="button" onClick={()=>setMobileOpen(v=>!v)} aria-label="Toggle menu" aria-expanded={mobileOpen}><span/><span/><span/></button><strong>Homeo Clinics</strong><span className="mobile-bar-tag">STAFF</span></div>
    {mobileOpen&&<button className="sidebar-scrim" aria-label="Close menu" onClick={()=>setMobileOpen(false)}/>}
  </>;
}
