"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { label: "Dashboard", href: "/", icon: "⌂" },
  { label: "Patients", href: "/patients", icon: "♙" },
  { label: "Appointments", href: "/appointments", icon: "▦" },
  { label: "All modules", href: "/#modules", icon: "▤" },
];

export default function AppNav() {
  const pathname = usePathname();
  return (
    <header className="app-nav-wrap">
      <Link href="/" className="app-brand" aria-label="Homeo Clinics dashboard">
        <div className="brand-mark">HC</div>
        <div><strong>Homeo Clinics</strong><span>Awan Homeopathic Clinic</span></div>
      </Link>
      <nav className="app-tabs" aria-label="Main navigation">
        {tabs.map((tab) => {
          const active = tab.href === "/" ? pathname === "/" : tab.href === "/#modules" ? false : pathname.startsWith(tab.href);
          return <Link key={tab.href} href={tab.href} className={`app-tab${active ? " active" : ""}`} aria-current={active ? "page" : undefined}>
            <span className="tab-icon" aria-hidden="true">{tab.icon}</span><span>{tab.label}</span>
          </Link>;
        })}
      </nav>
      <div className="nav-status"><span className="online-dot" /> Secure staff workspace</div>
    </header>
  );
}
