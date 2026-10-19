import { createFileRoute, Link } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Save, ExternalLink, LockKeyhole, FileText, Image, Palette, Users, Plus, Trash2, Upload, Search, Pencil, X } from 'lucide-react';
import { toast } from 'sonner';
import { SiteHeader } from '@/components/SiteHeader';
import { useSiteContent } from '@/components/SiteContentProvider';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { getAdminData, saveSiteContent, saveAdminProfile, setUserAdmin } from '@/lib/site.functions';
import { defaultContent, siteContentSchema, type SiteContent, type profileEditSchema } from '@/lib/site-content';
import type { z } from 'zod';

type Profile = z.infer<typeof profileEditSchema>;
export const Route = createFileRoute('/_authenticated/admin')({
  head:()=>({meta:[
    {title:'Administração — Blink'}, {name:'description',content:'Administração de conteúdo e perfis da Blink.'},
    {property:'og:title',content:'Administração — Blink'}, {property:'og:description',content:'Área restrita de administração da Blink.'},
    {property:'og:type',content:'website'}, {name:'twitter:card',content:'summary'}, {name:'robots',content:'noindex,nofollow'},
  ]}),
  component:Admin,
});
const tabs = [{id:'content',label:'Conteúdo',icon:FileText},{id:'media',label:'Imagens',icon:Image},{id:'appearance',label:'Aparência',icon:Palette},{id:'users',label:'Usuários',icon:Users}] as const;
const inputClass='w-full rounded-md border border-input bg-secondary px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring';
function Admin() {
  const fetchAdmin = useServerFn(getAdminData);
  const query = useQuery({queryKey:['admin-data'],queryFn:()=>fetchAdmin(),retry:false});
  const site = useSiteContent();
  if(query.isPending) return <><SiteHeader/><main className="mx-auto max-w-6xl px-6 py-14" role="status">Carregando administração…</main></>;
  if(query.error) return <><SiteHeader/><main className="mx-auto max-w-6xl px-6 py-14"><h1 className="text-2xl font-bold">Não foi possível carregar</h1><p className="mt-3 text-muted-foreground">{query.error.message}</p><Button className="mt-5" onClick={()=>query.refetch()}>Tentar novamente</Button></main></>;
  if(!query.data.allowed) return <><SiteHeader/><main className="mx-auto max-w-lg px-6 py-20 text-center"><LockKeyhole className="mx-auto h-10 w-10 text-primary"/><h1 className="mt-5 text-3xl font-bold">Acesso restrito</h1><p className="mt-4 text-muted-foreground">Esta conta não tem permissão para administrar o site. Entre com a conta administrativa autorizada.</p><Button asChild className="mt-6"><Link to="/conta">Voltar à minha conta</Link></Button></main></>;
  return <Editor adminIds={query.data.adminIds} isOwner={query.data.isOwner} initial={site.content} profiles={query.data.profiles.map(p=>({...p,full_name:p.full_name??'',company:p.company??'',phone:p.phone??'',job_title:p.job_title??'',bio:p.bio??''}))}/>;
}
function Editor({initial,profiles,adminIds,isOwner}:{initial:SiteContent;profiles:Profile[];adminIds:string[];isOwner:boolean}) {
  const toggleAdmin=useServerFn(setUserAdmin);
  const [roleSaving,setRoleSaving]=useState<string|null>(null);
  async function changeAdmin(id:string,grant:boolean){setRoleSaving(id);try{await toggleAdmin({data:{userId:id,grant}});await queryClient.invalidateQueries({queryKey:['admin-data']});toast.success(grant?'Agora é administrador.':'Acesso de administrador removido.');}catch(e){toast.error(e instanceof Error?e.message:'Não foi possível alterar.');}finally{setRoleSaving(null);}}
  const [draft,setDraft]=useState(initial);
  const [tab,setTab]=useState<string>('content');
  const [saving,setSaving]=useState(false);
  const [uploading,setUploading]=useState<string|null>(null);
  const [search,setSearch]=useState('');
  const [profile,setProfile]=useState<Profile|null>(null);
  const [profileSaving,setProfileSaving]=useState(false);
  const [dirty,setDirty]=useState(false);
  const queryClient=useQueryClient();
  const saveContent=useServerFn(saveSiteContent);
  const saveProfile=useServerFn(saveAdminProfile);
  const set=<K extends keyof SiteContent>(key:K,value:SiteContent[K])=>{setDraft(d=>({...d,[key]:value}));setDirty(true);};
  const field=(key:keyof SiteContent,label:string,multiline=false)=> <label className="block space-y-2" key={key}><span className="text-sm font-semibold">{label}</span>{multiline ? <textarea rows={3} className={inputClass} value={String(draft[key])} onChange={e=>set(key,e.target.value as never)}/> : <input className={inputClass} value={String(draft[key])} onChange={e=>set(key,e.target.value as never)}/>}</label>;
  async function save() {
    const parsed=siteContentSchema.safeParse(draft);
    if(!parsed.success) {toast.error(parsed.error.issues[0]?.message??'Confira os campos.');return;}
    setSaving(true);
    try {await saveContent({data:parsed.data});await queryClient.invalidateQueries({queryKey:['site-content']});setDirty(false);toast.success('Site atualizado!');}
    catch(e) {toast.error(e instanceof Error?e.message:'Não foi possível salvar.');}
    finally {setSaving(false);}
  }
  async function upload(file:File|undefined,key:'heroImage'|'logoImage') {
    if(!file) return;
    if(!['image/jpeg','image/png','image/webp'].includes(file.type) || file.size>5*1024*1024) {toast.error('Envie JPG, PNG ou WebP de até 5 MB.');return;}
    setUploading(key);
    try {
      const ext = file.type==='image/jpeg'?'jpg':file.type==='image/png'?'png':'webp';
      const path=`site/${crypto.randomUUID()}.${ext}`;
      const {error}=await supabase.storage.from('site-media').upload(path,file,{contentType:file.type});
      if(error) throw error;
      set(key,path);toast.success('Imagem enviada. Salve as alterações para aplicar.');
    } catch(e) {toast.error(e instanceof Error?e.message:'Falha ao enviar imagem.');}
    finally {setUploading(null);}
  }
  async function updateProfile(e:React.FormEvent) {
    e.preventDefault(); if(!profile) return; setProfileSaving(true);
    try {await saveProfile({data:profile});await queryClient.invalidateQueries({queryKey:['admin-data']});setProfile(null);toast.success('Perfil atualizado!');}
    catch(e) {toast.error(e instanceof Error?e.message:'Não foi possível salvar o perfil.');}
    finally {setProfileSaving(false);}
  }
  const filtered=profiles.filter(p=>`${p.full_name} ${p.company} ${p.phone}`.toLowerCase().includes(search.toLowerCase()));
  return <div className="min-h-screen"><SiteHeader/><main className="mx-auto max-w-6xl px-6 py-10">
    <div className="flex flex-wrap items-start justify-between gap-5 border-b border-border pb-7">
      <div><p className="text-xs font-semibold uppercase tracking-widest text-primary">Blink / Administração</p><h1 className="mt-2 text-3xl font-bold">Seu site, do seu jeito.</h1><p className="mt-2 text-sm text-muted-foreground">{dirty?'Alterações não salvas':'Tudo atualizado'}</p></div>
      <div className="flex flex-wrap gap-2"><Button asChild variant="outline"><Link to="/"><ExternalLink/>Ver site</Link></Button><Button onClick={save} disabled={saving||uploading!==null||!dirty}><Save/>{saving?'Salvando…':'Salvar alterações'}</Button></div>
    </div>
    <div className="my-6 flex flex-wrap gap-2" role="tablist" aria-label="Administração">{tabs.map(t=><Button key={t.id} role="tab" aria-selected={tab===t.id} variant={tab===t.id?'default':'ghost'} onClick={()=>setTab(t.id)}><t.icon/>{t.label}</Button>)}</div>
    {tab==='content' && <div className="max-w-3xl space-y-10">
      <section className="space-y-4"><h2 className="border-b border-border pb-3 text-xl font-bold">Página inicial</h2>{field('brand','Nome da marca')}{field('motto','Lema')}{field('eyebrow','Categoria')}{field('heroTitle','Frase principal',true)}{field('heroDescription','Descrição principal',true)}<div className="grid gap-4 sm:grid-cols-2">{field('signupLabel','Botão de cadastro')}{field('contactLabel','Botão de contato')}</div></section>
      <section className="space-y-4"><h2 className="border-b border-border pb-3 text-xl font-bold">Sobre a empresa</h2>{field('aboutTitle','Título')}<label className="block space-y-2"><span className="text-sm font-semibold">Parágrafos</span><textarea rows={7} className={inputClass} value={draft.aboutParagraphs.join('\n\n')} onChange={e=>set('aboutParagraphs',e.target.value.split('\n\n'))}/></label></section>
      <section className="space-y-4"><div className="flex items-center justify-between border-b border-border pb-3"><h2 className="text-xl font-bold">Serviços</h2><Button variant="outline" size="sm" disabled={draft.services.length>=20} onClick={()=>set('services',[...draft.services,{title:'Novo serviço',text:'',icon:'zap'}])}><Plus/>Adicionar</Button></div>
        {draft.services.map((service,i)=><div key={i} className="space-y-3 rounded-md border border-border bg-card p-4"><div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Serviço {i+1}</span><Button variant="ghost" size="icon" title="Remover serviço" aria-label={`Remover serviço ${i+1}`} onClick={()=>set('services',draft.services.filter((_,index)=>index!==i))}><Trash2/></Button></div><label className="block text-sm">Título<input className={`${inputClass} mt-2`} value={service.title} onChange={e=>set('services',draft.services.map((s,index)=>index===i?{...s,title:e.target.value}:s))}/></label><label className="block text-sm">Descrição<textarea className={`${inputClass} mt-2`} value={service.text} onChange={e=>set('services',draft.services.map((s,index)=>index===i?{...s,text:e.target.value}:s))}/></label><label className="block text-sm">Ícone<select className={`${inputClass} mt-2`} value={service.icon} onChange={e=>set('services',draft.services.map((s,index)=>index===i?{...s,icon:e.target.value as typeof s.icon}:s))}><option value="contact">Contato</option><option value="building">Empresa</option><option value="megaphone">Divulgação</option><option value="zap">Automação</option></select></label></div>)}
      </section>
      <section className="space-y-4"><h2 className="border-b border-border pb-3 text-xl font-bold">Chamada final e rodapé</h2>{field('ctaDescription','Descrição',true)}{field('ctaLabel','Botão final')}{field('footer','Rodapé')}</section>
      <section className="space-y-4"><h2 className="border-b border-border pb-3 text-xl font-bold">Contato</h2>{field('contactTitle','Título da página')}{field('contactDescription','Descrição da página',true)}<div className="grid gap-4 sm:grid-cols-2">{field('whatsapp','WhatsApp com código do país')}{field('email','E-mail')}</div>{field('contactMessage','Mensagem do WhatsApp',true)}</section>
      <section className="space-y-4"><h2 className="border-b border-border pb-3 text-xl font-bold">Minha conta</h2>{field('accountTitle','Título do contato personalizado')}{field('accountDescription','Descrição',true)}{field('accountButton','Botão do WhatsApp')}</section>
    </div>}
    {tab==='media' && <div className="max-w-3xl space-y-8"><h2 className="text-xl font-bold">Imagens do site</h2>{(['heroImage','logoImage'] as const).map(key=><section key={key} className="space-y-4 border-b border-border pb-7"><h3 className="font-bold">{key==='heroImage'?'Foto principal':'Logo'}</h3><label className="block space-y-2"><span className="text-sm font-semibold">Imagem enviada ou endereço HTTPS</span><input className={inputClass} value={draft[key]} onChange={e=>set(key,e.target.value)}/></label><div className="flex gap-2"><Button asChild variant="outline" disabled={uploading!==null}><label><Upload/>{uploading===key?'Enviando…':'Enviar imagem'}<input className="sr-only" type="file" aria-label={key==='heroImage'?'Enviar foto principal':'Enviar logo'} accept="image/jpeg,image/png,image/webp" disabled={uploading!==null} onChange={e=>{void upload(e.target.files?.[0],key);e.target.value='';}}/></label></Button><Button variant="ghost" onClick={()=>set(key,'')}>Usar original</Button></div></section>)}{field('heroAlt','Descrição da foto')}</div>}
    {tab==='appearance' && <div className="max-w-3xl space-y-9"><section><h2 className="text-xl font-bold">Cor de destaque</h2><div className="mt-4 flex gap-3">{(['orange','blue','green','pink'] as const).map((accent,i)=><Button key={accent} size="icon" variant="outline" aria-label={['Laranja','Azul','Verde','Rosa'][i]} title={['Laranja','Azul','Verde','Rosa'][i]} aria-pressed={draft.accent===accent} onClick={()=>set('accent',accent)} className={draft.accent===accent?'ring-2 ring-ring':''}><span className={`h-5 w-5 rounded-full swatch-${accent}`}/></Button>)}</div></section><section><h2 className="text-xl font-bold">Tema</h2><div className="mt-4 flex gap-2"><Button variant={draft.theme==='dark'?'default':'outline'} onClick={()=>set('theme','dark')}>Escuro</Button><Button variant={draft.theme==='light'?'default':'outline'} onClick={()=>set('theme','light')}>Claro</Button></div></section><section><h2 className="text-xl font-bold">Seções visíveis</h2><div className="mt-4 space-y-4">{([['showAbout','Sobre a empresa'],['showServices','Serviços'],['showCta','Chamada final']] as const).map(([key,label])=><label key={key} className="flex items-center gap-3"><input type="checkbox" checked={draft[key]} onChange={e=>set(key,e.target.checked)} className="h-4 w-4 accent-primary"/>{label}</label>)}</div></section><Button variant="outline" onClick={()=>{setDraft(defaultContent);setDirty(true);}}>Restaurar conteúdo original</Button></div>}
    {tab==='users' && <section><div className="flex flex-wrap items-center justify-between gap-4"><h2 className="text-xl font-bold">Perfis cadastrados <span className="text-muted-foreground">({profiles.length})</span></h2><label className="flex items-center gap-2"><Search className="h-4 w-4 text-muted-foreground"/><input aria-label="Buscar usuários" placeholder="Buscar por nome, empresa ou telefone" className={inputClass} value={search} onChange={e=>setSearch(e.target.value)}/></label></div><div className="mt-6 overflow-x-auto"><table className="w-full text-left text-sm"><thead className="border-b border-border text-muted-foreground"><tr><th className="py-3">Nome</th><th>Empresa</th><th>Telefone</th><th>Administrador</th><th className="text-right">Editar</th></tr></thead><tbody>{filtered.map(p=><tr key={p.id} className="border-b border-border"><td className="py-4 pr-4 font-semibold">{p.full_name||'Sem nome'}</td><td className="pr-4">{p.company||'—'}</td><td className="whitespace-nowrap pr-4">{p.phone||'—'}</td><td className="pr-4">{isOwner ? <Button size="sm" variant={adminIds.includes(p.id)?'default':'outline'} disabled={roleSaving===p.id} onClick={()=>void changeAdmin(p.id,!adminIds.includes(p.id))}>{adminIds.includes(p.id)?'Sim — remover':'Tornar admin'}</Button> : (adminIds.includes(p.id)?'Sim':'Não')}</td><td className="text-right"><Button size="icon" variant="ghost" aria-label={`Editar ${p.full_name||'perfil'}`} onClick={()=>setProfile(p)}><Pencil/></Button></td></tr>)}</tbody></table>{!filtered.length && <p className="py-10 text-center text-muted-foreground">Nenhum perfil encontrado.</p>}</div></section>}
    {profile && <div className="fixed inset-0 z-[60] flex items-center justify-center bg-background/90 p-4"><form onSubmit={updateProfile} role="dialog" aria-modal="true" aria-label="Editar perfil" className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-md border border-border bg-card p-6"><div className="mb-5 flex justify-between"><h2 className="text-xl font-bold">Editar perfil</h2><Button type="button" size="icon" variant="ghost" aria-label="Fechar edição" onClick={()=>setProfile(null)}><X/></Button></div><div className="space-y-4">{([['full_name','Nome completo'],['company','Empresa'],['phone','Telefone'],['job_title','Cargo'],['bio','Sobre você']] as const).map(([key,label])=><label key={key} className="block space-y-2"><span className="text-sm">{label}</span><input className={inputClass} value={profile[key]} onChange={e=>setProfile({...profile,[key]:e.target.value})}/></label>)}</div><Button className="mt-6" disabled={profileSaving}><Save/>{profileSaving?'Salvando…':'Salvar perfil'}</Button></form></div>}
  </main></div>;
}
