import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { siteQuery } from '@/lib/site-query';
import { defaultContent } from '@/lib/site-content';
const SiteContext = createContext({content:defaultContent,mediaUrls:{} as Record<string,string>,updatedAt:null as string|null});
export function SiteContentProvider({children}:{children:ReactNode}) {
  const {data} = useSuspenseQuery(siteQuery);
  useEffect(()=>{
    document.documentElement.dataset['accent']=data.content.accent;
    document.documentElement.dataset['theme']=data.content.theme;
  },[data.content.accent,data.content.theme]);
  return <SiteContext.Provider value={data}>{children}</SiteContext.Provider>;
}
export const useSiteContent = ()=>useContext(SiteContext);
export function whatsappDisplay(number:string) {
  if(number.length===13 && number.startsWith('55')) return `+55 ${number.slice(2,4)} ${number.slice(4,9)}-${number.slice(9)}`;
  return `+${number}`;
}