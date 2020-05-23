const express = require("express")
const router = express.Router()
const mongoose = require('mongoose')
const bcriptjs = require('bcryptjs')
require("../models/Usuario")
const Usuario = mongoose.model("usuarios")
const passport = require("passport")

router.get("/registro", (req, res) => {
    res.render("usuarios/registro")
})

router.post("/registro", (req, res) => {
    var erros = []
    var nome = req.body.nome
    var email = req.body.email
    var senha = req.body.senha
    var senha2 = req.body.senha2

    if (!nome || typeof nome == undefined || nome == null) {
        erros.push({ texto: "Nome inválido" })
    }
    if (!email || typeof email == undefined || email == null) {
        erros.push({ texto: "E-mail inválido" })
    }
    if (!senha || typeof senha == undefined || senha == null) {
        erros.push({ texto: "Senha inválida" })
    }
    if (senha < 4) {
        erros.push({ texto: "Senha muito curta" })
    }

    if (senha != senha2) {
        erros.push({ texto: "As senhas são diferentes, tente novamente!" })
    }

    if (erros.length > 0) {
        res.render("usuarios/registro", { erros: erros })
    } else {
        Usuario.findOne({ email: email }).then((usuario) => {
            if (usuario) {
                req.flash("error_msg", "Já existe uma conta com este e-mail no nosso sistema")
                res.redirect("/usuarios/registro")
            } else {
                const novoUsuario = new Usuario({
                    nome: req.body.nome,
                    email: req.body.email,
                    senha: req.body.senha
                })

                bcriptjs.genSalt(10, (erro, salt) => {
                    bcriptjs.hash(novoUsuario.senha, salt, (erro, hash) => {
                        if (erro) {
                            req.flash("error_msg", "Houve um erro durante o salvamento do usuário")
                            res.redirect("/")
                        } else {
                            novoUsuario.senha = hash;

                            novoUsuario.save().then(() => {
                                req.flash("success_msg", "Usuário criado com sucesso!")
                                res.redirect("/")
                            }).catch((err) => {
                                req.flash("error_msg", "Houve um erro ao criar o usuário, tente novamente!")
                                res.redirect("/usuarios/registro")
                            })
                        }
                    })
                })
            }
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno", err)
            res.redirect("/")
        })
    }
})

router.get("/login", (req, res) => {
    res.render("usuarios/login")
})

router.post("/login", (req, res, next) => {

    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/usuarios/login",
        failureFlash: true
    })(req, res, next)
})

router.get("/logout",(req, res) => {
    req.logout()
    req.flash("success_msg", "Deslogado com sucesso")
    res.redirect("/")

})
module.exports = router