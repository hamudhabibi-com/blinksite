import { createFileRoute } from "@tanstack/react-router";
import { MessageCircle, Mail } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { contactLink, openContact } from "@/lib/contact";

import { useSiteContent, whatsappDisplay } from "@/components/SiteContentProvider";

export const Route = createFileRoute("/contato")({
  head: () => ({
    meta: [
      { title: "Contato — Blink" },
      { name: "description", content: "Fale diretamente com a Blink pelo WhatsApp ou e-mail." },
      { property: "og:title", content: "Contato — Blink" },
      { property: "og:description", content: "Fale diretamente com a Blink." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Contato,
});

function Contato() {
  const { content } = useSiteContent();
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="mx-auto max-w-3xl px-6 py-20 text-center">
        <h1 className="text-4xl font-extrabold md:text-6xl">{content.contactTitle}</h1>
        <p className="mt-4 text-muted-foreground">{content.contactDescription}</p>
        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          <a href={contactLink(null, null, content)} onClick={openContact} target="_blank" rel="noopener noreferrer" className="rounded-3xl bg-gradient-primary p-8 text-primary-foreground shadow-glow transition hover:scale-105">
            <MessageCircle className="mx-auto h-10 w-10" />
            <p className="mt-4 text-xl font-bold">WhatsApp</p>
            <p className="mt-1 text-sm opacity-90">{whatsappDisplay(content.whatsapp)}</p>
          </a>
          <a href={`mailto:${content.email}`} className="rounded-3xl border border-border bg-card p-8 transition hover:scale-105 hover:border-primary">
            <Mail className="mx-auto h-10 w-10 text-primary" />
            <p className="mt-4 break-all text-lg font-bold">{content.email}</p>
          </a>
        </div>
      </div>
    </div>
  );
}
