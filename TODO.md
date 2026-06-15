# TODO - Correção CRUD de Usuários (Admin Panel)

## Step 1: Análise e revisão do código atual
- [x] Identificar que o problema está no frontend (admin_fixed.js) e que CRUD de usuários usa array local/saveUsers vazio.
- [x] Confirmar que backend expõe rotas corretas: GET/POST/PUT/DELETE /api/admin/users.

## Step 2: Planejar alterações no frontend
- [x] Definir que o CRUD de usuários será 100% via API e com refresh após cada operação.
- [x] Definir remoção de initialUsers/hardcoded e qualquer dependência de array local para usuários.

## Step 3: Implementar correção
- [x] Alterar `public/admin_fixed.js`:
  - [x] Remover `initialUsers` e qualquer uso/seed em memória.
  - [x] Refatorar `submit` do userForm: POST/PUT + recarregar via GET.
  - [x] Refatorar `deleteUser`: DELETE + recarregar via GET.
  - [x] Garantir renderAdminUsers usa somente `users` preenchido por `loadAdminData()`.
  - [x] Remover/remediar funções/trechos `saveUsers()` e lógica baseada em users local.


## Step 4: Verificação
- [ ] Validar fluxo:
  - [ ] Criar usuário => aparece após salvar sem refresh manual
  - [ ] Editar usuário => persiste no Postgres e reflete imediatamente
  - [ ] Excluir usuário => persiste e reflete imediatamente
- [ ] Conferir que após atualizar a página a lista vem somente do Postgres.

