Passos para habilitar PostgreSQL:

1) Configure variáveis de ambiente:
   PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE

2) (Opcional) Garanta que `data/*.json` estão corretos.

3) Rode:
   node server.js

4) Se quiser migrar os dados existentes (data/*.json) para o banco:
   node migrate-json-to-postgres.js

O servidor chama initializeDatabase() automaticamente na inicialização.

