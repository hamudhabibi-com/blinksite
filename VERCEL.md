# Publicar a Blink na Vercel

O site já está preparado: quando o build roda na Vercel, ele usa automaticamente o formato de servidor da Vercel. Siga os passos abaixo.

## 1. Enviar o código para o GitHub

No Lovable: **Configurações do projeto → Git → Conectar GitHub**. Isso cria um repositório privado com todo o código do site.

## 2. Importar na Vercel

1. Crie uma conta em [vercel.com](https://vercel.com) (pode entrar com o GitHub).
2. Clique em **Add New → Project** e importe o repositório da Blink.
3. A Vercel detecta o Vite automaticamente. Não precisa mudar comando de build nem pasta de saída.

## 3. Variáveis de ambiente

Em **Settings → Environment Variables** do projeto na Vercel, adicione:

| Nome | Valor | Onde encontrar |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | `https://gzdftgrzrxfiowiemxah.supabase.co` | valor público, pode copiar daqui |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_hGUAGIdyoJejPBOGoF5ThA_YPFYJ5bG` | valor público, pode copiar daqui |
| `SUPABASE_URL` | igual ao `VITE_SUPABASE_URL` | mesmo valor |
| `SUPABASE_PUBLISHABLE_KEY` | igual ao `VITE_SUPABASE_PUBLISHABLE_KEY` | mesmo valor |

Marque as variáveis para **Production**, **Preview** e **Development**.

## 4. Deploy

Clique em **Deploy**. A cada alteração feita no Lovable, o código sincroniza com o GitHub e a Vercel publica automaticamente.

## 5. Domínio meublink.net

1. Compre o domínio em qualquer registrador (Namecheap, GoDaddy, Registro.br para .br etc.).
2. Na Vercel: **Settings → Domains → Add**, digite `meublink.net` e siga as instruções de DNS que ela mostrar.

## O que funciona na Vercel

- Login com e-mail/senha, Google e Lovable — funciona, o banco continua no Lovable Cloud.
- Cadastro, perfis, área administrativa, edição de conteúdo — funcionam, pois usam a sessão do usuário.
- **Ressalva:** imagens enviadas pela administração (logo/foto principal) usam uma chave interna do Lovable Cloud que não pode ser exportada. Na Vercel, essas imagens podem não aparecer; os textos e demais edições funcionam normalmente. O site publicado aqui no Lovable continua com tudo funcionando.

## Redirecionamento do login social

Depois do primeiro deploy, adicione o endereço da Vercel (ex.: `https://seu-projeto.vercel.app`) como URL de redirecionamento permitida no provedor de login, para que o botão "Entrar com Google" funcione no novo endereço.
