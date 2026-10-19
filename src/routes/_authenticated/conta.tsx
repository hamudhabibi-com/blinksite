import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { MessageCircle, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";
import { contactLink, openContact } from "@/lib/contact";

import { useSiteContent } from "@/components/SiteContentProvider";

export const Route = createFileRoute("/_authenticated/conta")({
  head: () => ({
    meta: [
      { title: "Minha conta — Blink" },
      { name: "description", content: "Gerencie suas informações na Blink." },
      { property: "og:title", content: "Minha conta — Blink" },
      { property: "og:description", content: "Gerencie suas informações na Blink." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Conta,
});

const schema = z.object({
  full_name: z.string().trim().max(100),
  company: z.string().trim().max(100),
  job_title: z.string().trim().max(100),
  phone: z.string().trim().max(30),
  bio: z.string().trim().max(500),
});
type Form = z.infer<typeof schema>;
const empty: Form = { full_name: "", company: "", job_title: "", phone: "", bio: "" };

function Conta() {
  const { content } = useSiteContent();
  const [form, setForm] = useState<Form>(empty);
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      setUserId(u.user.id);
      setEmail(u.user.email ?? "");
      const { data } = await supabase.from("profiles").select("*").eq("id", u.user.id).maybeSingle();
      if (data) setForm({
        full_name: data.full_name ?? "", company: data.company ?? "", job_title: data.job_title ?? "",
        phone: data.phone ?? "", bio: data.bio ?? "",
      });
    })();
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) { toast.error(parsed.error.issues[0]?.message ?? "Dados inválidos"); return; }
    setSaving(true);
    const { error } = await supabase.from("profiles").upsert({ id: userId, ...parsed.data });
    setSaving(false);
    if (error) toast.error("Erro ao salvar"); else toast.success("Alterações salvas!");
  }

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const input = "w-full rounded-xl border border-input bg-secondary px-4 py-3 outline-none focus:border-primary";
  const field = (key: keyof Form, label: string) => (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-muted-foreground">{label}</span>
      <input className={input} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
    </label>
  );

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="mx-auto grid max-w-5xl gap-8 px-6 py-14 md:grid-cols-[1fr_320px]">
        <form onSubmit={save} className="space-y-5 rounded-3xl border border-border bg-card p-8">
          <div>
            <h1 className="text-3xl font-bold">Olá{form.full_name ? `, ${form.full_name.split(" ")[0]}` : ""}! 👋</h1>
            <p className="text-sm text-muted-foreground">{email}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {field("full_name", "Nome completo")}
            {field("phone", "Telefone")}
            {field("company", "Empresa")}
            {field("job_title", "Cargo")}
          </div>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-muted-foreground">Sobre você</span>
            <textarea rows={4} className={input} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
          </label>
          <div className="flex flex-wrap gap-3">
            <button disabled={saving} className="rounded-full bg-gradient-primary px-7 py-3 font-bold text-primary-foreground disabled:opacity-60">
              {saving ? "Salvando..." : "Salvar alterações"}
            </button>
            <button type="button" onClick={signOut} className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 font-semibold hover:bg-secondary">
              <LogOut className="h-4 w-4" /> Sair
            </button>
          </div>
        </form>
        <aside className="h-fit rounded-3xl bg-gradient-primary p-8 text-primary-foreground">
          <h2 className="text-xl font-bold">{content.accountTitle}</h2>
          <p className="mt-2 text-sm opacity-80">{content.accountDescription}</p>
          <a href={contactLink(form.full_name, form.company, content)} onClick={openContact} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-background px-5 py-3 font-bold text-foreground">
            <MessageCircle className="h-5 w-5" /> {content.accountButton}
          </a>
          <p className="mt-6 font-display text-lg font-extrabold">{content.motto}</p>
        </aside>
      </div>
    </div>
  );
}
