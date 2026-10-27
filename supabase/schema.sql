-- HYKON: tabela de mensagens do formulário de contato
create table if not exists public.contatos (
  id         bigint generated always as identity primary key,
  criado_em  timestamptz not null default now(),
  nome       text not null check (char_length(nome) between 2 and 120),
  email      text not null check (char_length(email) between 5 and 160),
  telefone   text check (char_length(telefone) <= 40),
  assunto    text not null check (char_length(assunto) between 3 and 160),
  mensagem   text not null check (char_length(mensagem) between 10 and 4000),
  lido       boolean not null default false
);

-- Segurança: o site (chave anon) só pode INSERIR. Só você, logado no painel, lê.
alter table public.contatos enable row level security;

drop policy if exists "site pode inserir contatos" on public.contatos;
create policy "site pode inserir contatos"
  on public.contatos for insert
  to anon
  with check (true);
-- Nenhuma policy de select/update/delete para anon = ninguém de fora consegue ler.
