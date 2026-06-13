import { supabase } from "@/integrations/supabase/client";

export type UsageStatus = {
  allowed: boolean;
  used: number;
  limit: number;
  remaining: number;
  planType: string;
};

export const FREE_DAILY_LIMIT = 4;

const today = () => new Date().toISOString().slice(0, 10);

export async function getUsageStatus(userId: string): Promise<UsageStatus> {
  const { data } = await supabase
    .from("usage_limits")
    .select("*")
    .eq("user_id", userId)
    .eq("date", today())
    .maybeSingle();

  if (!data) {
    // Row should be auto-created on signup; fall back gracefully
    return {
      allowed: true,
      used: 0,
      limit: FREE_DAILY_LIMIT,
      remaining: FREE_DAILY_LIMIT,
      planType: "free",
    };
  }

  const used = data.ai_actions_used ?? 0;
  const limit = data.daily_limit ?? FREE_DAILY_LIMIT;
  return {
    allowed: used < limit,
    used,
    limit,
    remaining: Math.max(0, limit - used),
    planType: data.plan_type ?? "free",
  };
}

export async function incrementUsage(userId: string): Promise<UsageStatus> {
  const { data: existing } = await supabase
    .from("usage_limits")
    .select("*")
    .eq("user_id", userId)
    .eq("date", today())
    .maybeSingle();

  if (!existing) {
    await supabase.from("usage_limits").insert({
      user_id: userId,
      date: today(),
      ai_actions_used: 1,
      daily_limit: FREE_DAILY_LIMIT,
      plan_type: "free",
    });
    return { allowed: true, used: 1, limit: FREE_DAILY_LIMIT, remaining: FREE_DAILY_LIMIT - 1, planType: "free" };
  }

  const newUsed = (existing.ai_actions_used ?? 0) + 1;
  await supabase
    .from("usage_limits")
    .update({ ai_actions_used: newUsed })
    .eq("id", existing.id);

  return {
    allowed: newUsed <= (existing.daily_limit ?? FREE_DAILY_LIMIT),
    used: newUsed,
    limit: existing.daily_limit ?? FREE_DAILY_LIMIT,
    remaining: Math.max(0, (existing.daily_limit ?? FREE_DAILY_LIMIT) - newUsed),
    planType: existing.plan_type ?? "free",
  };
}
