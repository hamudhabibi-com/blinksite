import { z } from 'zod';

const text = z.string().trim().max(3000);
const media = z.string().max(1000).refine(value => !value || value.startsWith('site/') || /^https:\/\//.test(value), 'Use uma imagem enviada ou um endereço HTTPS.');
export const siteContentSchema = z.object({
  brand: z.string().trim().min(1).max(60), motto: text, eyebrow: text,
  heroTitle: text, heroDescription: text, heroImage: media, heroAlt: text, logoImage: media,
  signupLabel: text, contactLabel: text, aboutTitle: text, aboutParagraphs: z.array(text).max(10),
  services: z.array(z.object({ title: z.string().trim().min(1).max(100), text, icon: z.enum(['contact','building','megaphone','zap']) })).max(20),
  ctaDescription: text, ctaLabel: text, footer: text,
  contactTitle: text, contactDescription: text, whatsapp: z.string().regex(/^\d{10,15}$/, 'Informe o número com código do país, apenas dígitos.'),
  email: z.string().email(), contactMessage: text,
  accountTitle: text, accountDescription: text, accountButton: text,
  statsLabel: text, statsValue: text,
  showAbout: z.boolean(), showServices: z.boolean(), showCta: z.boolean(),
  accent: z.enum(['orange','blue','green','pink']), theme: z.enum(['dark','light']),
});
export type SiteContent = z.infer<typeof siteContentSchema>;
export const defaultContent: SiteContent = {
  brand:'Blink', motto:'Seu momento, merece um blink!', eyebrow:'Tecnologia NFC',
  heroTitle:'E se você pudesse conectar qualquer pessoa ao seu mundo com apenas um toque?',
  heroDescription:'Imagine nunca mais precisar digitar um contato, procurar um link ou entregar um cartão que será esquecido na carteira.',
  heroImage:'', heroAlt:'Cartão NFC Blink aproximado de um celular', logoImage:'', signupLabel:'Criar minha conta', contactLabel:'Fale conosco',
  aboutTitle:'Nós somos a Blink.', aboutParagraphs:[
    'Uma empresa de tecnologia que transforma cartões e chips inteligentes em ferramentas de conexão instantânea.',
    'Utilizando a tecnologia NFC, nossos produtos permitem compartilhar contatos, apresentar empresas, divulgar marcas e iniciar ações digitais simplesmente aproximando o cartão de um celular compatível.',
    'Mas a Blink vai muito além de um cartão inteligente. Estamos conectando o mundo físico ao digital, tornando as interações mais rápidas, práticas e inteligentes.'
  ],
  services:[
    {icon:'contact',title:'Compartilhe contatos',text:'Seu contato salvo no celular de quem você conhece, sem digitar nada.'},
    {icon:'building',title:'Apresente empresas',text:'Site, portfólio e redes sociais a um toque de distância.'},
    {icon:'megaphone',title:'Divulgue marcas',text:'Chips inteligentes em produtos, vitrines e eventos.'},
    {icon:'zap',title:'Automação digital',text:'Inicie ações, pagamentos e formulários instantaneamente.'}
  ],
  ctaDescription:'Nosso objetivo é transformar a maneira como pessoas e empresas se conectam, criando experiências que cabem na palma da mão.', ctaLabel:'Quero meu Blink',
  footer:'© 2026 Blink · Seu momento, merece um blink!', contactTitle:'Vamos dar um blink?', contactDescription:'Fale direto com nosso time e descubra como conectar seu mundo com um toque.',
  whatsapp:'5511941750989',email:'otaviotoledo341@gmail.com',contactMessage:'Quero saber mais sobre os cartões NFC da Blink.',
  accountTitle:'Seu link direto com a Blink',accountDescription:'Um link personalizado com seu nome e empresa para falar direto com nosso time.',accountButton:'Falar com a Blink',
  statsValue:'+200',statsLabel:'clientes satisfeitos',
  showAbout:true, showServices:true, showCta:true,accent:'orange',theme:'dark',
};
export function parseContent(value: unknown): SiteContent {
  const partial = value && typeof value === 'object' ? value : {};
  const parsed = siteContentSchema.safeParse({...defaultContent,...partial});
  return parsed.success ? parsed.data : defaultContent;
}
export const profileEditSchema = z.object({
  id:z.string().uuid(),full_name:z.string().trim().max(100),company:z.string().trim().max(100),
  phone:z.string().trim().max(30),job_title:z.string().trim().max(100),bio:z.string().trim().max(500),
});
