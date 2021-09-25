const express = require('express');

const usuarios = require('./controladores/usuarios');
const pokemons = require('./controladores/pokemons');

const rotas = express();

// usuarios
rotas.post('/usuarios', usuarios.cadastrarUsuario);
rotas.post('/login', usuarios.login);

// pokemons
rotas.post('/pokemons', pokemons.cadastrarPokemon);
rotas.put('/pokemons/:id', pokemons.atualizarPokemon);
rotas.get('/pokemons', pokemons.listarPokemons);
rotas.get('/pokemons/:id', pokemons.consultarPokemon);
rotas.delete('/pokemons/:id', pokemons.excluirPokemon);

module.exports = rotas;