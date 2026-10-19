import type { SiteContent } from "./site-content";
// Contatos oficiais da Blink
export const BLINK_WHATSAPP = "5511941750989";
export const BLINK_EMAIL = "otaviotoledo341@gmail.com";
export const BLINK_WHATSAPP_DISPLAY = "+55 11 94175-0989";

export function contactLink(name?: string | null, company?: string | null, content?: SiteContent) {
  const who = name ? `Olá! Sou ${name}${company ? `, da ${company}` : ""}.` : "Olá!";
  const text = `${who} ${content?.contactMessage ?? "Quero saber mais sobre os cartões NFC da Blink."} ${content?.motto ?? "Seu momento, merece um blink!"}`;
  return `https://wa.me/${content?.whatsapp ?? BLINK_WHATSAPP}?text=${encodeURIComponent(text)}`;
}

// Open directly from the click, outside the preview iframe. Do not navigate
// the embedded page: WhatsApp refuses to render inside another website.
export function openContact(event: { preventDefault: () => void; currentTarget: { href: string } }) {
  event.preventDefault();
  window.open(event.currentTarget.href, "_blank", "noopener,noreferrer");
}
