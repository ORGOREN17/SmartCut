import { supabase } from "@/integrations/supabase/client";
import type { UserProfile } from "@/data/profileTypes";
import { DEFAULT_PROFILE } from "@/data/profileTypes";

export async function setUserRole(userId: string, role: "customer" | "barber" | "admin") {
  await supabase.from("user_roles").upsert(
    { user_id: userId, role },
    { onConflict: "user_id,role" }
  );
  await supabase.from("user_profiles").update({ role }).eq("user_id", userId);
}

export async function getUserProfile(userId: string) {
  const { data } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  return data;
}

export async function upsertCustomerProfile(userId: string, fields: Record<string, any>) {
  const { data: existing } = await supabase
    .from("customer_profiles")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (existing) {
    await (supabase.from("customer_profiles") as any).update(fields).eq("user_id", userId);
  } else {
    await (supabase.from("customer_profiles") as any).insert({ user_id: userId, ...fields });
  }
}

export async function upsertBarberProfile(userId: string, fields: Record<string, any>) {
  const { data: existing } = await supabase
    .from("barber_profiles")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (existing) {
    await (supabase.from("barber_profiles") as any).update(fields).eq("user_id", userId);
  } else {
    await (supabase.from("barber_profiles") as any).insert({ user_id: userId, ...fields });
  }
}

export async function getBarberProfile(userId: string) {
  const { data } = await supabase
    .from("barber_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  return data;
}

/* ---------- Full Profile (UI) <-> Supabase mapping ---------- */

function toInt(v: string): number | null {
  if (!v) return null;
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : null;
}

export async function loadFullProfileFromSupabase(userId: string): Promise<UserProfile | null> {
  const [{ data: up }, { data: cp }] = await Promise.all([
    supabase.from("user_profiles").select("*").eq("user_id", userId).maybeSingle(),
    supabase.from("customer_profiles").select("*").eq("user_id", userId).maybeSingle(),
  ]);

  if (!up && !cp) return null;

  const c: any = cp ?? {};
  const u: any = up ?? {};

  return {
    ...DEFAULT_PROFILE,
    firstName: u.first_name ?? "",
    lastName: u.last_name ?? "",
    email: u.email ?? "",
    city: u.city ?? "",
    country: u.country ?? "",
    age: c.age != null ? String(c.age) : "",
    gender: c.gender ?? "",
    hairType: c.hair_type ?? "",
    currentHairLength: c.current_hair_length ?? "",
    hairDensity: c.hair_density ?? "",
    hairlineStatus: c.hairline_status ?? "",
    facialHair: c.beard_status ?? "",
    preferredVibe: c.preferred_style ?? "",
    maintenanceLevel: c.maintenance_preference ?? "",
    preferredLength: c.preferred_length ?? "",
    opennessToChange: c.openness_to_change ?? "",
    workStyle: c.work_style ?? "",
    haircutFrequency: c.haircut_frequency ?? "",
    stylingRoutine: c.styling_routine ?? "",
    notes: c.notes ?? "",
  };
}

export async function saveFullProfileToSupabase(userId: string, p: UserProfile): Promise<void> {
  const userFields = {
    first_name: p.firstName || null,
    last_name: p.lastName || null,
    email: p.email || null,
    city: p.city || null,
    country: p.country || null,
  };

  const customerFields = {
    age: toInt(p.age),
    gender: p.gender || null,
    hair_type: p.hairType || null,
    current_hair_length: p.currentHairLength || null,
    hair_density: p.hairDensity || null,
    hairline_status: p.hairlineStatus || null,
    beard_status: p.facialHair || null,
    preferred_style: p.preferredVibe || null,
    maintenance_preference: p.maintenanceLevel || null,
    preferred_length: p.preferredLength || null,
    openness_to_change: p.opennessToChange || null,
    work_style: p.workStyle || null,
    haircut_frequency: p.haircutFrequency || null,
    styling_routine: p.stylingRoutine || null,
    notes: p.notes || null,
  };

  // Ensure user_profiles row exists (trigger usually creates it, but be safe)
  const { data: existingUp } = await supabase
    .from("user_profiles")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (existingUp) {
    await (supabase.from("user_profiles") as any).update(userFields).eq("user_id", userId);
  } else {
    await (supabase.from("user_profiles") as any).insert({ user_id: userId, ...userFields });
  }

  await upsertCustomerProfile(userId, customerFields);
}
