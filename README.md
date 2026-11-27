# Homeo Clinics — Awan Homeopathic Clinic

Multi-branch internal clinic management platform. Interface: English. Currency: PKR. No public patient login in the initial release.

## Scope
- Owner/admin dashboard across all branches.
- Branch-isolated patients, appointments, consultations, prescriptions, pharmacy, billing, lab, inventory, online orders and reports.
- Role and branch-scoped staff access: Owner/Admin, General Manager, Doctor, Pharmacist, Reception, Customer Support, Order Staff and Lab Staff.
- Doctor enters a prescription once; pharmacy staff in the same branch receive it and create the bill without re-entering prescription lines.
- Audit trail for sensitive actions.

## Architecture
- Next.js + TypeScript web application.
- Supabase Auth + PostgreSQL.
- PostgreSQL Row Level Security (RLS) is mandatory for branch data isolation.
- PKR monetary values stored as integer paisa or NUMERIC(12,2), never floating point.

## Setup
1. Create a Supabase project.
2. Run `supabase/schema.sql` in the Supabase SQL editor.
3. Copy `.env.example` to `.env.local` and fill in the Supabase project URL and anon key.
4. Install dependencies with `npm install`, then run `npm run dev`.

## Security / production status
This repository is the application source scaffold, not a deployed production system. Do not enter real patient data until Supabase is configured, RLS is verified with separate branch users, backups and audit logging are enabled, and deployment/security testing is complete. Never expose a Supabase service-role key in browser code or commit secrets.
