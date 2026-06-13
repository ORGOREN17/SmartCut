import { useCallback, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getUsageStatus, incrementUsage, FREE_DAILY_LIMIT } from "@/services/usageLimitService";
import { toast } from "sonner";

export const UPGRADE_MESSAGE =
  "You've reached your free daily SmartCut limit. Upgrade to Pro for more analyses.";

export function useUsageGate() {
  const { user } = useAuth();
  const [limitReached, setLimitReached] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);

  /** Returns true if the action is allowed (and increments usage). */
  const consume = useCallback(async (): Promise<boolean> => {
    // Anonymous / demo users are not gated (keeps demo flow alive).
    if (!user) return true;

    try {
      const status = await getUsageStatus(user.id);
      if (!status.allowed) {
        setLimitReached(true);
        setRemaining(0);
        toast.error(UPGRADE_MESSAGE);
        return false;
      }
      const next = await incrementUsage(user.id);
      setRemaining(next.remaining);
      setLimitReached(!next.allowed && next.remaining <= 0);
      return true;
    } catch (e) {
      // Fail open in demo: if usage tracking errors, do not block
      console.warn("[useUsageGate] usage check failed, allowing action:", e);
      return true;
    }
  }, [user]);

  const dismiss = useCallback(() => setLimitReached(false), []);

  return { consume, limitReached, remaining, dismiss, FREE_DAILY_LIMIT };
}
