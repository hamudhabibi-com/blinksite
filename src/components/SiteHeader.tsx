import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useSiteContent } from "./SiteContentProvider";
import { Button } from "./ui/button";

export function BlinkLogo({ className = "" }: { className?: string }) {
  const { content, mediaUrls } = useSiteContent();
  if (content.logoImage && mediaUrls[content.logoImage]) return <img src={mediaUrls[content.logoImage]} alt={content.brand} className="h-10 max-w-40 object-contain" />;
  if (content.brand.toLowerCase() !== "blink") return <span className={`font-display font-bold ${className}`}>{content.brand}</span>;
  return (
    <span className={`relative inline-block font-display font-extrabold tracking-tight ${className}`}>
      bl
      <span className="relative">
        ı
        <span className="pulse-dot absolute -top-[0.3em] left-1/2 h-[0.32em] w-[0.32em] -translate-x-1/2 rounded-full bg-primary" />
      </span>
      nk
    </span>
  );
}

export function SiteHeader() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    let active = true;
    async function update(nextUser: User | null) {
      if (!active) return;
      setUser(nextUser);
      setIsAdmin(false);
      if (!nextUser) return;
      const { data } = await supabase.rpc('has_role', { _user_id: nextUser.id, _role: 'admin' });
      if (active) setIsAdmin(data === true);
    }
    supabase.auth.getUser().then(({ data }) => update(data.user));
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (['SIGNED_IN', 'SIGNED_OUT', 'USER_UPDATED'].includes(event)) void update(session?.user ?? null);
    });
    return () => { active = false; data.subscription.unsubscribe(); };
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/"><BlinkLogo className="text-3xl" /></Link>
        <nav className="flex items-center gap-3 text-sm font-semibold">
          <Link to="/contato" className="text-muted-foreground hover:text-foreground">Contato</Link>
          {isAdmin && <Button asChild variant="ghost" size="sm"><Link to="/admin">Administrar</Link></Button>}
          {user ? (
            <Link to="/conta" className="rounded-full bg-gradient-primary px-5 py-2 text-primary-foreground">Minha conta</Link>
          ) : (
            <Link to="/auth" className="rounded-full bg-gradient-primary px-5 py-2 text-primary-foreground">Entrar</Link>
          )}
        </nav>
      </div>
    </header>
  );
}
