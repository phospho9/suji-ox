import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";

import { lovable } from "@/integrations/lovable/index";
import { supabase } from "@/integrations/supabase/client";
import { syncUser } from "@/lib/quiz-api";

export type QuizUser = {
  id: string;
  email: string;
  displayName: string;
};

function toQuizUser(session: Session | null): QuizUser | null {
  if (!session?.user) return null;
  const meta = (session.user.user_metadata ?? {}) as Record<string, unknown>;
  const name =
    (typeof meta["full_name"] === "string" && meta["full_name"]) ||
    (typeof meta["name"] === "string" && meta["name"]) ||
    session.user.email ||
    "학생";
  return {
    id: session.user.id,
    email: session.user.email ?? "",
    displayName: String(name),
  };
}

export function useAuth() {
  const [user, setUser] = useState<QuizUser | null>(null);
  const [ready, setReady] = useState(false);
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    const synced = new Set<string>();

    const handle = (session: Session | null, shouldSync: boolean) => {
      const next = toQuizUser(session);
      // 동일한 사용자면 객체 참조를 유지해 화면이 다시 로딩되지 않도록 한다
      setUser((prev) => {
        if (prev && next && prev.id === next.id && prev.displayName === next.displayName) {
          return prev;
        }
        return next;
      });
      if (next && shouldSync && !synced.has(next.id)) {
        synced.add(next.id);
        // 로그인 성공 직후 백엔드에 사용자 정보 동기화
        void syncUser({
          id: next.id,
          email: next.email,
          display_name: next.displayName,
        }).catch(() => undefined);
      }
    };

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      handle(session, event === "SIGNED_IN" || event === "INITIAL_SESSION");
    });

    void supabase.auth.getSession().then(({ data }) => {
      handle(data.session, true);
      setReady(true);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  async function signInWithGoogle() {
    setSigningIn(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if ("error" in result && result.error) return;
    } finally {
      setSigningIn(false);
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
  }

  return { user, ready, signingIn, signInWithGoogle, signOut };
}
