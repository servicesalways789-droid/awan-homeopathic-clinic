"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const primary = [
  { label: "Dashboard", href: "/", icon: "grid" },
  { label: "Patients", href: "/patients", icon: "users" },
  { label: "Appointments", href: "/appointments", icon: "calendar" },
];
const modules = [
  { label: "Doctor Workspace", href: "/operations/doctor" },
  { label: "Pharmacy & Billing", href: "/operations/pharmacy" },
  { label: "Medicine Inventory", href: "/operations/inventory" },
  { label: "Laboratory", href: "/operations/lab" },
  { label: "Online Orders", href: "/operations/orders" },
  { label: "Customer Support", href: "/operations/support" },
  { label: "Branch Directory", href: "/operations/branches" },
  { label: "Staff & Permissions", href: "/operations/staff" },
  { label: "Reports & Analytics", href: "/operations/reports" },
];
function Glyph({name}:{name:string}) {
  const paths:Record<string,React.ReactNode> = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="10" cy="7" r="4"/><path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18"/></>,
  };
  return <svg viewBox="0 0 24 24" aria-hidden="true" className="nav-glyph" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}
export default function AppNav() {
  const pathname = usePathname();
  const [menuOpen,setMenuOpen] = useState(false);
  const [mobileOpen,setMobileOpen] = useState(false);
  const moduleActive = pathname.startsWith("/operations/");
  return <header className="site-header">
    <div className="site-header-inner">
      <Link href="/" className="app-brand" aria-label="Homeo Clinics dashboard">
        <div className="brand-mark">HC</div>
        <div className="brand-copy"><strong>Homeo Clinics</strong><span>Awan Homeopathic Clinic</span></div>
      </Link>
      <button className="mobile-menu-toggle" type="button" aria-label="Toggle navigation" aria-expanded={mobileOpen} onClick={()=>setMobileOpen(v=>!v)}>
        <span/><span/><span/>
      </button>
      <nav className={`main-navigation${mobileOpen?" mobile-open":""}`} aria-label="Main navigation">
        <div className="primary-nav-links">
          {primary.map(item=>{const active=item.href==="/"?pathname==="/":pathname.startsWith(item.href);return <Link key={item.href} href={item.href} className={`nav-link${active?" is-active":""}`} aria-current={active?"page":undefined} onClick={()=>setMobileOpen(false)}><Glyph name={item.icon}/><span>{item.label}</span></Link>;})}
          <div className="nav-dropdown">
            <button type="button" className={`nav-link nav-dropdown-trigger${moduleActive?" is-active":""}`} aria-expanded={menuOpen} onClick={()=>setMenuOpen(v=>!v)}>
              <span className="modules-grid-icon"><i/><i/><i/><i/></span><span>Clinic Modules</span><span className="chevron">⌄</span>
            </button>
            {menuOpen&&<div className="modules-dropdown">{modules.map(item=><Link key={item.href} href={item.href} className={pathname===item.href?"dropdown-active":""} onClick={()=>{setMenuOpen(false);setMobileOpen(false);}}>{item.label}<span>›</span></Link>)}</div>}
          </div>
        </div>
        <div className="header-utility"><span className="secure-indicator"><i/>Staff workspace</span><span className="header-divider"/><span className="currency-label">PKR</span></div>
      </nav>
    </div>
  </header>;
}
