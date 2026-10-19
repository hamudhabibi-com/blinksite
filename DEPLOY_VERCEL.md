# Deploy na Vercel — Blink

## Importação
1. Extraia este ZIP e envie os arquivos a um repositório privado no GitHub.
2. Em https://vercel.com/new, importe o repositório.
3. Em **Framework Preset**, mantenha a detecção automática (Vite, se exibido).
4. Em **Build Command**, use `npm run build` (ou padrão `vite build`).
5. Não defina `dist` como Output Directory: esta aplicação usa TanStack Start/Nitro com saída de servidor Vercel. Mantenha a saída padrão/automática.
6. Em **Settings > Environment Variables**, configure as variáveis do `.env.example` com os valores da sua configuração original. Não exponha chaves secretas como variáveis `VITE_`.
7. Clique em **Deploy**. Após publicar, configure a URL de redirecionamento OAuth no seu provedor de autenticação (Supabase/Lovable), se necessário.

## Observações
O banco e login dependem do Supabase/Lovable original. Para detalhes, leia VERCEL.md. A configuração do Nitro em vite.config.ts seleciona automaticamente o preset `vercel` quando `VERCEL` estiver presente.
