import { describe,it,expect } from 'vitest';
import { defaultContent, siteContentSchema, parseContent } from './site-content';
import { contactLink } from './contact';
describe('Administrative site settings',()=>{
  it('keeps the existing official contacts until edited',()=>{
    const content=parseContent({});
    expect(content.whatsapp).toBe('5511941750989');
    expect(content.email).toBe('otaviotoledo341@gmail.com');
  });
  it('applies a saved contact to personalized WhatsApp links',()=>{
    const content={...defaultContent,whatsapp:'5511988887777',contactMessage:'Quero um cartão.'};
    const url=new URL(contactLink('Otavio','Blink',content));
    expect(url.pathname).toBe('/5511988887777');
    expect(url.searchParams.get('text')).toContain('Sou Otavio, da Blink. Quero um cartão.');
  });
  it('rejects executable image addresses',()=>{
    expect(siteContentSchema.safeParse({...defaultContent,logoImage:'javascript:alert(1)'}).success).toBe(false);
  });
  it('rejects invalid WhatsApp destinations',()=>{
    expect(siteContentSchema.safeParse({...defaultContent,whatsapp:'abc'}).success).toBe(false);
  });
});
