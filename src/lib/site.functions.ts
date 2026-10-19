import { createServerFn } from '@tanstack/react-start';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { parseContent, siteContentSchema, profileEditSchema } from './site-content';

export const getSiteContent = createServerFn({method:'GET'}).handler(async () => {
  const url = process.env['SUPABASE_URL'];
  const key = process.env['SUPABASE_PUBLISHABLE_KEY'] ?? process.env['SUPABASE_ANON_KEY'];
  if (!url || !key) throw new Error('Configuração do site indisponível.');
  const client = createClient<Database>(url,key,{
    auth:{persistSession:false,autoRefreshToken:false},
    global:{fetch:(input,init)=>{
      const headers = new Headers(init?.headers);
      if(key.startsWith('sb_') && headers.get('Authorization') === `Bearer ${key}`) headers.delete('Authorization');
      headers.set('apikey',key);
      return fetch(input,{...init,headers});
    }},
  });
  const {data,error} = await client.from('site_settings').select('content,updated_at').eq('id','main').maybeSingle();
  if(error) throw new Error(error.message);
  const content = parseContent(data?.content);
  const mediaUrls: Record<string,string> = {};
  // Signed URLs are minted with the privileged client: no browser role can read the bucket directly.
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
  for(const path of [content.heroImage,content.logoImage]) {
    if(!path) continue;
    if(path.startsWith('https://')) {mediaUrls[path] = path;continue;}
    const {data:signed,error:mediaError} = await supabaseAdmin.storage.from('site-media').createSignedUrl(path,3600);
    if(mediaError) throw new Error(mediaError.message);
    // Server-local storage endpoints are never sent to the browser.
    const browserUrl = import.meta.env['VITE_SUPABASE_URL'];
    mediaUrls[path] = signed.signedUrl.replace(url,browserUrl);
  }
  return {content,mediaUrls,updatedAt:data?.updated_at ?? null};
});

export const getAdminData = createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).handler(async ({context})=>{
  const {data:allowed,error:roleError} = await context.supabase.rpc('has_role',{_user_id:context.userId,_role:'admin'});
  if(roleError) throw new Error(roleError.message);
  if(!allowed) return {allowed:false as const,profiles:[],adminIds:[] as string[],isOwner:false};
  const {data,error} = await context.supabase.from('profiles').select('id,full_name,company,phone,job_title,bio,created_at,updated_at').order('created_at',{ascending:false}).limit(1000);
  if(error) throw new Error(error.message);
  const {data:ids} = await context.supabase.rpc('list_admin_ids');
  const {data:isOwner} = await context.supabase.rpc('is_blink_owner',{_user_id:context.userId});
  return {allowed:true as const,profiles:data,adminIds:(ids??[]) as string[],isOwner:!!isOwner};
});

export const setUserAdmin = createServerFn({method:'POST'}).middleware([requireSupabaseAuth])
  .inputValidator((input:{userId:string;grant:boolean})=>({userId:String(input.userId),grant:!!input.grant})).handler(async ({data,context})=>{
    const {error} = await context.supabase.rpc('set_user_admin',{_target:data.userId,_grant:data.grant});
    if(error) throw new Error(error.message);
    return {saved:true};
});

export const saveSiteContent = createServerFn({method:'POST'}).middleware([requireSupabaseAuth])
  .inputValidator((input:unknown)=>siteContentSchema.parse(input)).handler(async ({data,context})=>{
    const {data:allowed,error:roleError} = await context.supabase.rpc('has_role',{_user_id:context.userId,_role:'admin'});
    if(roleError || !allowed) throw new Error('Acesso administrativo necessário.');
    const {error} = await context.supabase.from('site_settings').upsert({id:'main',content:data}).select('id').single();
    if(error) throw new Error(error.message);
    return {saved:true};
  });
export const saveAdminProfile = createServerFn({method:'POST'}).middleware([requireSupabaseAuth])
  .inputValidator((input:unknown)=>profileEditSchema.parse(input)).handler(async ({data,context})=>{
    const {data:allowed,error:roleError} = await context.supabase.rpc('has_role',{_user_id:context.userId,_role:'admin'});
    if(roleError || !allowed) throw new Error('Acesso administrativo necessário.');
    const {id,...fields}=data;
    const {error} = await context.supabase.from('profiles').update(fields).eq('id',id).select('id').single();
    if(error) throw new Error(error.message);
    return {saved:true};
  });
