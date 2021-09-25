const conexao = require('../conexao');
const jwt = require('jsonwebtoken');
const jwtSecret = require("../jwt_secret");

const cadastrarPokemon = async (req, res) => {
    const { nome, apelido, habilidades, imagem, token } = req.body;
    if (!nome || !nome.trim()) return res.status(400).json("O campo nome é obrigatório.");
    if (!token) return res.status(400).json("O token é obrigatório.");
    if (typeof habilidades !== 'string') return res.status(400).json("O campo Habilidades está em um formato inválido.");
    if (!habilidades || !habilidades.trim()) return res.status(400).json("O campo Habilidades é obrigatório.");

    const usuario = validar(res, token);
    if (!usuario.id) return console.log("Não Autorizado!");

    try {
        const pokemon = await conexao.query(`
        insert into pokemons 
        (usuario_id, nome, habilidades, imagem, apelido) 
        values ($1, $2, $3, $4, $5)`, [usuario.id, nome, habilidades, imagem, apelido]
        );
        if (pokemon.rowCount === 0) return res.status(400).json('Não foi possivel cadastrar o Pokémon');

        return res.status(201).json('Pokémon cadastrado com sucesso.');
    } catch (error) {
        return res.status(400).json(error.message);
    }
}

const atualizarPokemon = async (req, res) => {
    const { id } = req.params;
    const { nome, apelido, habilidades, imagem, token } = req.body;

    const usuario = validar(res, token);
    if (!usuario.id) return console.log("Não Autorizado!");

    try {
        const pokemon = await conexao.query('select * from pokemons where id = $1', [id]);
        if (pokemon.rowCount === 0) return res.status(404).json('Pokémon não encontrado');
        if (!apelido || !apelido.trim()) return res.status(400).json("O campo apelido é obrigatório.");

        const apelidoAtualizado = await conexao.query('update pokemons set apelido = $1 where id = $2', [apelido, id]);
        if (apelidoAtualizado.rowCount === 0) return res.status(400).json('Não foi possível atualizar o Pokémon');

        if (nome || habilidades || imagem) {
            return res.status(200).json("Apenas o campo 'apelido' do Pokémon foi alterado com sucesso!")
        } else {
            return res.status(200).json('Pokémon foi atualizado com sucesso!');
        }
    } catch (error) {
        return res.status(400).json(error.message);
    }
}

const listarPokemons = async (req, res) => {
    const { token } = req.body;

    const usuario = validar(res, token);
    if (!usuario.id) return console.log("Não Autorizado!");

    try {
        const { rows: pokemons } = await conexao.query(`
        select pokemons.id, usuarios.nome as usuario, pokemons.nome, pokemons.apelido, pokemons.habilidades, pokemons.imagem 
        from pokemons 
        left join usuarios on pokemons.usuario_id = usuarios.id 
        order by pokemons.id`
        );

        for (const pokemon of pokemons) {
            pokemon.habilidades = pokemon.habilidades.split(", ");
        }

        return res.status(200).json(pokemons);
    } catch (error) {
        return res.status(400).json(error.message);
    }
}

const consultarPokemon = async (req, res) => {
    const { id } = req.params;
    const { token } = req.body;

    const usuario = validar(res, token);
    if (!usuario.id) return console.log("Não Autorizado!");

    try {
        const pokemon = await conexao.query(`
        select pokemons.id, usuarios.nome as usuario, pokemons.nome, pokemons.apelido, pokemons.habilidades, pokemons.imagem 
        from pokemons 
        left join usuarios on pokemons.usuario_id = usuarios.id 
        where pokemons.id = $1`, [id]
        );

        if (pokemon.rowCount === 0) return res.status(404).json('Pokémon não encontrado');
        pokemon.rows[0].habilidades = pokemon.rows[0].habilidades.split(", ");

        return res.status(200).json(pokemon.rows[0]);
    } catch (error) {
        return res.status(400).json(error.message);
    }
}

const excluirPokemon = async (req, res) => {
    const { id } = req.params;
    const { token } = req.body;

    const usuario = validar(res, token);
    if (!usuario.id) return console.log("Não Autorizado!");

    try {
        const pokemon = await conexao.query('select * from pokemons where id = $1', [id]);
        if (pokemon.rowCount === 0) return res.status(404).json('Pokémon não encontrado');

        const pokémonExcluido = await conexao.query('delete from pokemons where id = $1', [id]);
        if (pokémonExcluido.rowCount === 0) return res.status(400).json('Não foi possível excluir o Pokémon');

        return res.status(200).json('Pokémon foi excluido com sucesso.');
    } catch (error) {
        return res.status(400).json(error.message);
    }
}

function validar(res, token) {
    try {
        const usuario = jwt.verify(token, jwtSecret);
        console.log(`${usuario.nome} Autenticado`);
        return usuario;
    } catch (error) {
        return res.status(401).json("Token Inválido");
    }
}

module.exports = { listarPokemons, consultarPokemon, cadastrarPokemon, atualizarPokemon, excluirPokemon }