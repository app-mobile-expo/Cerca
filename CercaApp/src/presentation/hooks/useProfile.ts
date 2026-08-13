import { useCallback, useEffect, useState } from "react";

import type { Actor } from "@/types/auth";
import { getCurrentProfile } from "@/infrastructure/api/profile/profile.repository";
import { useAuth } from "@/presentation/context/AuthContext";

type ProfileState = {
  profile: Actor | null;
  error: string | null;
  isLoading: boolean;
  reload: () => Promise<void>;
};

export function useProfile(): ProfileState {
  const { session } = useAuth();
  const [profile, setProfile] = useState<Actor | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(async (): Promise<void> => {
    if (!session) {
      setProfile(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const currentProfile = await getCurrentProfile(session.accessToken);
      setProfile(currentProfile);
    } catch {
      setError("We could not load your profile details.");
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { profile, error, isLoading, reload };
}
