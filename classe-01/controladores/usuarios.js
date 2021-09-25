const conexao = require('../conexao');
const securePassword = require('secure-password');
const jwt = require('jsonwebtoken');
const jwtSecret = require("../jwt_secret");

const pwd = securePassword();

const cadastrarUsuario = async (req, res) => {
    const { nome, email, senha } = req.body;

    !nome.trim() && res.status(400).json('Nome é obrigatório');
    if (!email.trim() || !email.trim().includes('@') || !email.trim().includes('.') || email.trim().length < 6) {
        return res.status(400).json('E-Mail inválido')
    }

    !senha.trim() && res.status(400).json('Senha é obrigatória');

    try {
        const hash = (await pwd.hash(Buffer.from(senha))).toString("hex");

        const validarUsuario = await conexao.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        if (validarUsuario.rowCount !== 0) return res.status(400).json('E-mail já cadastrado!');

        const usuario = await conexao.query(
            `INSERT INTO usuarios 
            (nome, email, senha) 
            VALUES ($1, $2, $3)`, [nome, email, hash]
        );

        usuario.rowCount === 0 ?
            res.status(400).json('Não foi possível cadastrar o usuário') :
            res.status(201).json("Usuário Cadastrado com sucesso!");
    } catch (error) {
        return res.status(400).json(error.message);
    }
}

const login = async (req, res) => {
    const { email, senha } = req.body;

    if (!email) return res.status(401).json("O campo email é obrigatório");
    if (!senha) return res.status(401).json("O campo senha é obrigatório");

    try {
        const usuarios = await conexao.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        if (usuarios.rowCount === 0) return res.status(400).json("Email ou senha incorretos");

        const usuario = usuarios.rows[0];

        const result = await pwd.verify(Buffer.from(senha), Buffer.from(usuario.senha, "hex"));

        switch (result) {
            case securePassword.INVALID_UNRECOGNIZED_HASH:
            case securePassword.INVALID:
                return res.status(401).json("Email ou senha incorretos");
            case securePassword.VALID:
                break;
            case securePassword.VALID_NEEDS_REHASH:
                try {
                    const hash = (await pwd.hash(Buffer.from(senha))).toString("hex");
                    const usuario = await conexao.query('UPDATE usuarios SET senha = $1 where email = $2', [hash, email])
                } catch {
                }
                break;
        }

        const token = jwt.sign({
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email
        }, jwtSecret, {
            expiresIn: "1h"
        });

        res.status(200).json({ token: token });
    } catch (error) {
        return res.status(400).json(error.message);
    }
}

module.exports = { cadastrarUsuario, login }