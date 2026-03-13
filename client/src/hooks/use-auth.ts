import { useState, useEffect } from "react";
import type { User, SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseClient } from "@/lib/supabase";

export interface AuthState {
  user: User | null;
  loading: boolean;
  supabase: SupabaseClient | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);

  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null;

    getSupabaseClient()
      .then((sb) => {
        setSupabase(sb);

        sb.auth.getSession().then(({ data: { session } }) => {
          setUser(session?.user ?? null);
          setLoading(false);
        });

        const { data } = sb.auth.onAuthStateChange((_event, session) => {
          setUser(session?.user ?? null);
          setLoading(false);
        });
        subscription = data.subscription;
      })
      .catch(() => {
        setLoading(false);
      });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    const sb = await getSupabaseClient();
    await sb.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });
  };

  const signOut = async () => {
    const sb = await getSupabaseClient();
    await sb.auth.signOut();
  };

  return { user, loading, supabase, signInWithGoogle, signOut };
}
