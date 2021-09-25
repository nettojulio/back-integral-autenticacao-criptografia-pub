DROP DATABASE IF EXISTS catalogo_pokemons;
CREATE DATABASE catalogo_pokemons;

DROP TABLE IF EXISTS usuarios;

CREATE TABLE usuarios (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  senha TEXT NOT NULL
);

DROP TABLE IF EXISTS pokemons;

CREATE TABLE pokemons (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL,
  nome TEXT NOT NULL,
  habilidades TEXT NOT NULL,
  imagem TEXT,
  apelido TEXT,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);