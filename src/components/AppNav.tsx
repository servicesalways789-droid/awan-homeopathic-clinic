"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { label: "Overview", href: "/", icon: "⌂" },
  { label: "Patients", href: "/patients", icon: "♙" },
  { label: "Appointments", href: "/appointments", icon: "▦" },
];

export default function AppNav() {
  const pathname = usePathname();
  return (
    <div className="app-nav-wrap">
      <div className="app-brand">
        <div className="brand-mark">HC</div>
        <div><strong>Homeo Clinics</strong><span>Awan Homeopathic Clinic</span></div>
      </div>
      <nav className="app-tabs" aria-label="Main navigation">
        {tabs.map((tab) => {
          const active = tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
          return <Link key={tab.href} href={tab.href} className={`app-tab${active ? " active" : ""}`} aria-current={active ? "page" : undefined}>
            <span className="tab-icon" aria-hidden="true">{tab.icon}</span>{tab.label}
          </Link>;
        })}
      </nav>
      <div className="nav-status"><span className="online-dot" /> Internal workspace</div>
    </div>
  );
}
