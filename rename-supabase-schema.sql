-- Supabase schema migration: renomear empresa para funcionario
BEGIN;

ALTER TABLE IF EXISTS empresas RENAME TO funcionarios;

ALTER TABLE IF EXISTS chamados RENAME COLUMN empresa_id TO funcionario_id;

COMMIT;
