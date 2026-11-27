-- Homeo Clinics initial PostgreSQL schema for Supabase.
-- Run in Supabase SQL Editor. Test RLS with separate branch users before production.
create extension if not exists pgcrypto;

create table if not exists public.branches (
 id uuid primary key default gen_random_uuid(),
 name text not null default 'Awan Homeopathic Clinic',
 address text not null,
 phone text,
 is_active boolean not null default true,
 created_at timestamptz not null default now()
);

create table if not exists public.staff_profiles (
 user_id uuid primary key references auth.users(id) on delete cascade,
 full_name text not null,
 role text not null check (role in ('owner','admin','general_manager','doctor','pharmacist','reception','customer_support','order_staff','lab_staff')),
 branch_id uuid references public.branches(id),
 is_active boolean not null default true,
 created_at timestamptz not null default now(),
 check ((role in ('owner','admin') and branch_id is null) or (role not in ('owner','admin') and branch_id is not null))
);

create or replace function public.is_global_admin()
returns boolean language sql stable security definer set search_path=public
as $$ select exists(select 1 from public.staff_profiles p where p.user_id=auth.uid() and p.is_active and p.role in ('owner','admin')) $$;

create or replace function public.has_branch_access(target_branch uuid)
returns boolean language sql stable security definer set search_path=public
as $$ select public.is_global_admin() or exists(select 1 from public.staff_profiles p where p.user_id=auth.uid() and p.is_active and p.branch_id=target_branch) $$;

create table if not exists public.patients (
 id uuid primary key default gen_random_uuid(),
 branch_id uuid not null references public.branches(id),
 patient_code text,
 full_name text not null,
 phone text,
 date_of_birth date,
 sex text,
 address text,
 notes text,
 created_by uuid default auth.uid(),
 created_at timestamptz not null default now(),
 unique(branch_id,patient_code)
);

create table if not exists public.appointments (
 id uuid primary key default gen_random_uuid(),
 branch_id uuid not null references public.branches(id),
 patient_id uuid not null references public.patients(id),
 doctor_user_id uuid references auth.users(id),
 scheduled_at timestamptz not null,
 status text not null default 'requested' check(status in ('requested','confirmed','completed','cancelled','no_show')),
 notes text,
 created_at timestamptz not null default now()
);

create table if not exists public.prescriptions (
 id uuid primary key default gen_random_uuid(),
 branch_id uuid not null references public.branches(id),
 patient_id uuid not null references public.patients(id),
 doctor_user_id uuid not null references auth.users(id),
 appointment_id uuid references public.appointments(id),
 clinical_notes text,
 status text not null default 'sent_to_pharmacy' check(status in ('draft','sent_to_pharmacy','dispensed','cancelled')),
 created_at timestamptz not null default now()
);

create table if not exists public.prescription_items (
 id uuid primary key default gen_random_uuid(),
 prescription_id uuid not null references public.prescriptions(id) on delete cascade,
 medicine_name text not null,
 dosage text,
 frequency text,
 duration text,
 quantity numeric(12,2),
 instructions text
);

create table if not exists public.pharmacy_invoices (
 id uuid primary key default gen_random_uuid(),
 branch_id uuid not null references public.branches(id),
 prescription_id uuid references public.prescriptions(id),
 patient_id uuid not null references public.patients(id),
 created_by uuid default auth.uid(),
 subtotal numeric(12,2) not null default 0,
 discount numeric(12,2) not null default 0,
 total numeric(12,2) not null default 0,
 payment_status text not null default 'unpaid' check(payment_status in ('unpaid','partial','paid')),
 created_at timestamptz not null default now()
);

create table if not exists public.invoice_items (
 id uuid primary key default gen_random_uuid(),
 invoice_id uuid not null references public.pharmacy_invoices(id) on delete cascade,
 medicine_name text not null,
 quantity numeric(12,2) not null,
 unit_price numeric(12,2) not null,
 line_total numeric(12,2) not null
);

create table if not exists public.lab_orders (
 id uuid primary key default gen_random_uuid(),
 branch_id uuid not null references public.branches(id),
 patient_id uuid not null references public.patients(id),
 ordered_by uuid default auth.uid(),
 test_name text not null,
 status text not null default 'pending' check(status in ('pending','sample_collected','completed','cancelled')),
 result_notes text,
 created_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
 id bigint generated always as identity primary key,
 branch_id uuid references public.branches(id),
 actor uuid default auth.uid(),
 action text not null,
 table_name text not null,
 record_id uuid,
 created_at timestamptz not null default now()
);

-- Enable RLS on every tenant-scoped table.
alter table public.branches enable row level security;
alter table public.staff_profiles enable row level security;
alter table public.patients enable row level security;
alter table public.appointments enable row level security;
alter table public.prescriptions enable row level security;
alter table public.prescription_items enable row level security;
alter table public.pharmacy_invoices enable row level security;
alter table public.invoice_items enable row level security;
alter table public.lab_orders enable row level security;
alter table public.audit_logs enable row level security;

drop policy if exists branches_read on public.branches;
create policy branches_read on public.branches for select to authenticated using (public.is_global_admin() or public.has_branch_access(id));
drop policy if exists branches_admin_write on public.branches;
create policy branches_admin_write on public.branches for all to authenticated using(public.is_global_admin()) with check(public.is_global_admin());

drop policy if exists staff_read on public.staff_profiles;
create policy staff_read on public.staff_profiles for select to authenticated using(public.is_global_admin() or user_id=auth.uid() or public.has_branch_access(branch_id));
drop policy if exists staff_admin_write on public.staff_profiles;
create policy staff_admin_write on public.staff_profiles for all to authenticated using(public.is_global_admin()) with check(public.is_global_admin());

drop policy if exists patients_branch_access on public.patients;
create policy patients_branch_access on public.patients for all to authenticated using(public.has_branch_access(branch_id)) with check(public.has_branch_access(branch_id));
drop policy if exists appointments_branch_access on public.appointments;
create policy appointments_branch_access on public.appointments for all to authenticated using(public.has_branch_access(branch_id)) with check(public.has_branch_access(branch_id));
drop policy if exists prescriptions_branch_access on public.prescriptions;
create policy prescriptions_branch_access on public.prescriptions for all to authenticated using(public.has_branch_access(branch_id)) with check(public.has_branch_access(branch_id));
drop policy if exists pharmacy_invoices_branch_access on public.pharmacy_invoices;
create policy pharmacy_invoices_branch_access on public.pharmacy_invoices for all to authenticated using(public.has_branch_access(branch_id)) with check(public.has_branch_access(branch_id));
drop policy if exists lab_orders_branch_access on public.lab_orders;
create policy lab_orders_branch_access on public.lab_orders for all to authenticated using(public.has_branch_access(branch_id)) with check(public.has_branch_access(branch_id));

drop policy if exists prescription_items_access on public.prescription_items;
create policy prescription_items_access on public.prescription_items for all to authenticated
using(exists(select 1 from public.prescriptions p where p.id=prescription_id and public.has_branch_access(p.branch_id)))
with check(exists(select 1 from public.prescriptions p where p.id=prescription_id and public.has_branch_access(p.branch_id)));
drop policy if exists invoice_items_access on public.invoice_items;
create policy invoice_items_access on public.invoice_items for all to authenticated
using(exists(select 1 from public.pharmacy_invoices i where i.id=invoice_id and public.has_branch_access(i.branch_id)))
with check(exists(select 1 from public.pharmacy_invoices i where i.id=invoice_id and public.has_branch_access(i.branch_id)));
drop policy if exists audit_branch_access on public.audit_logs;
create policy audit_branch_access on public.audit_logs for select to authenticated using(public.is_global_admin() or public.has_branch_access(branch_id));
