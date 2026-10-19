import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import "@lovable.dev/cloud-auth-js/styles.css";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { SiteHeader, BlinkLogo } from "@/components/SiteHeader";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar — Blink" },
      { name: "description", content: "Acesse sua conta Blink e gerencie seus dados." },
      { property: "og:title", content: "Entrar — Blink" },
      { property: "og:description", content: "Acesse sua conta Blink." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

const schema = z.object({
  email: z.string().trim().email("E-mail inválido").max(255),
  password: z.string().min(6, "Senha com no mínimo 6 caracteres").max(72),
  name: z.string().trim().max(100).optional(),
});

function AuthPage() {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse({ email, password, name: mode === "up" ? name : undefined });
    if (!parsed.success) { toast.error(parsed.error.issues[0]?.message ?? "Dados inválidos"); return; }
    setLoading(true);
    if (mode === "in") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (error) { toast.error("E-mail ou senha incorretos"); return; }
      navigate({ to: "/conta" });
    } else {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { emailRedirectTo: window.location.origin, data: { full_name: name } },
      });
      setLoading(false);
      if (error) { toast.error(error.message); return; }
      toast.success("Conta criada! Confira seu e-mail para confirmar.");
      setMode("in");
    }
  }

  async function oauth(provider: "google" | "lovable") {
    const r = await lovable.auth.signInWithOAuth(provider, { redirect_uri: window.location.origin });
    if (r.error) { toast.error("Não foi possível entrar"); return; }
    if (r.redirected) return;
    navigate({ to: "/conta" });
  }

  const input = "w-full rounded-xl border border-input bg-secondary px-4 py-3 outline-none focus:border-primary";
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="mx-auto max-w-md px-6 py-16">
        <div className="rounded-3xl border border-border bg-card p-8 shadow-glow">
          <div className="text-center"><BlinkLogo className="text-5xl" /></div>
          <h1 className="mt-4 text-center text-2xl font-bold">{mode === "in" ? "Bem-vindo de volta" : "Crie sua conta"}</h1>
          <form onSubmit={submit} className="mt-8 space-y-4">
            {mode === "up" && <input className={input} placeholder="Nome completo" value={name} onChange={(e) => setName(e.target.value)} />}
            <input className={input} type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input className={input} type="password" placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button disabled={loading} className="w-full rounded-full bg-gradient-primary py-3 font-bold text-primary-foreground disabled:opacity-60">
              {loading ? "Aguarde..." : mode === "in" ? "Entrar" : "Cadastrar"}
            </button>
          </form>
          <div className="my-6 text-center text-xs text-muted-foreground">ou</div>
          <div className="space-y-3">
            <button onClick={() => oauth("google")} className="w-full rounded-full border border-border py-3 font-semibold hover:bg-secondary">Continuar com Google</button>
            <button type="button" className="lovable-auth-button w-full" onClick={() => oauth("lovable")}>Continue with Lovable</button>
          </div>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "in" ? "Ainda não tem conta?" : "Já tem conta?"}{" "}
            <button onClick={() => setMode(mode === "in" ? "up" : "in")} className="font-bold text-primary">
              {mode === "in" ? "Cadastre-se" : "Entrar"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
