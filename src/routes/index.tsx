import { createFileRoute, Link } from "@tanstack/react-router";
import { Contact, Building2, Megaphone, Zap } from "lucide-react";
import hero from "@/assets/hero.jpg";
import { SiteHeader } from "@/components/SiteHeader";
import { contactLink, openContact } from "@/lib/contact";
import { useSiteContent } from "@/components/SiteContentProvider";
import { siteQuery } from "@/lib/site-query";

export const Route = createFileRoute("/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(siteQuery),
  head: ({ loaderData }) => ({
    meta: [
      { title: "Blink — Cartões NFC e conexão instantânea" },
      { name: "description", content: "Cartões e chips NFC que conectam pessoas e empresas com apenas um toque. Seu momento, merece um blink!" },
      { property: "og:title", content: "Blink — Seu momento, merece um blink!" },
      { property: "og:description", content: "Compartilhe contatos, marcas e ações digitais aproximando um cartão do celular." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      ...(loaderData?.content.heroImage.startsWith('https://') ? [
        { property: "og:image", content: loaderData.content.heroImage },
        { name: "twitter:image", content: loaderData.content.heroImage },
      ] : []),
    ],
  }),
  component: Index,
});

const icons = { contact: Contact, building: Building2, megaphone: Megaphone, zap: Zap };

function Index() {
  const { content, mediaUrls } = useSiteContent();
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="relative overflow-hidden">
        <div className="absolute -top-40 right-0 h-[500px] w-[500px] rounded-full bg-primary/20 blur-3xl" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 md:grid-cols-2">
          <div>
            <span className="inline-block rounded-full border border-primary/40 bg-primary/10 px-4 py-1 text-xs font-bold uppercase tracking-widest text-primary">{content.eyebrow}</span>
            <h1 className="mt-6 text-4xl font-extrabold leading-tight md:text-6xl">
              {content.heroTitle}
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              {content.heroDescription}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/auth" className="rounded-full bg-gradient-primary px-7 py-3 font-bold text-primary-foreground shadow-glow transition hover:scale-105">{content.signupLabel}</Link>
              <a href={contactLink(null, null, content)} onClick={openContact} target="_blank" rel="noopener noreferrer" className="rounded-full border border-border px-7 py-3 font-bold hover:bg-secondary">{content.contactLabel}</a>
            </div>
            <div className="mt-10 flex items-center gap-4">
              <span className="font-display text-5xl font-extrabold text-primary">{content.statsValue}</span>
              <span className="max-w-[160px] text-sm font-semibold leading-snug text-muted-foreground">{content.statsLabel}</span>
            </div>
          </div>
          <img src={mediaUrls[content.heroImage] || hero} alt={content.heroAlt} width={1280} height={960} className="rounded-3xl border border-border shadow-glow" />
        </div>
      </section>

      {(content.showAbout || content.showServices) && <section className="mx-auto max-w-6xl px-6 py-16">
        {content.showAbout && <div className="grid gap-10 md:grid-cols-2">
          <h2 className="text-3xl font-bold md:text-4xl">{content.aboutTitle}</h2>
          <div className="space-y-4 text-muted-foreground">
            {content.aboutParagraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
          </div>
        </div>}
        {content.showServices && <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {content.services.map((f, index) => { const Icon = icons[f.icon]; return (
            <div key={index} className="rounded-2xl border border-border bg-card p-6 transition hover:-translate-y-1 hover:border-primary/50">
              <Icon className="h-8 w-8 text-primary" />
              <h3 className="mt-4 font-bold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.text}</p>
            </div>
          ); })}
        </div>}
      </section>}

      {content.showCta && <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="rounded-3xl bg-gradient-primary p-12 text-center text-primary-foreground md:p-20">
          <p className="mx-auto max-w-2xl font-semibold opacity-80">{content.ctaDescription}</p>
          <p className="mt-6 font-display text-4xl font-extrabold md:text-7xl">{content.motto}</p>
          <a href={contactLink(null, null, content)} onClick={openContact} target="_blank" rel="noopener noreferrer" className="mt-10 inline-block rounded-full bg-background px-8 py-4 font-bold text-foreground transition hover:scale-105">{content.ctaLabel}</a>
        </div>
      </section>}
      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">{content.footer}</footer>
    </div>
  );
}
