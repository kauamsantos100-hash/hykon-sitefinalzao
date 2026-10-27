# HYKON — site

Site estático (HTML/CSS/JS). Mensagens do formulário vão para o Supabase.

## 1. Banco de dados (Supabase)
1. Crie conta em https://supabase.com e um projeto novo (região São Paulo).
2. Menu **SQL Editor** → cole `supabase/schema.sql` → **Run**.
3. **Project Settings → API**: copie `Project URL` e a chave `anon public`.
4. Cole os dois em `js/main.js` (`SUPABASE_URL` e `SUPABASE_ANON_KEY`).
5. As mensagens aparecem em **Table Editor → contatos**.
   (Nunca coloque a chave `service_role` no site.)

## 2. Publicar no GitHub Pages
1. Crie um repositório em https://github.com/new (ex.: `hykon-site`), público.
2. Envie os arquivos (mantenha `index.html` na raiz):
   git init && git add . && git commit -m "site HYKON"
   git branch -M main
   git remote add origin https://github.com/SEU_USUARIO/hykon-site.git
   git push -u origin main
3. No repositório: **Settings → Pages → Source: Deploy from a branch → main / (root) → Save**.
4. Em ~1 min o site fica em https://SEU_USUARIO.github.io/hykon-site/

## 3. Domínio próprio (opcional)
Em **Settings → Pages → Custom domain**, informe seu domínio e crie no seu provedor
um CNAME `www` → `SEU_USUARIO.github.io`. Marque **Enforce HTTPS**.
