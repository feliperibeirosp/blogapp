const express = require("express")
const router = express.Router();
const mongoose = require("mongoose")
require("../models/Categoria")
const Categoria = mongoose.model("categorias")
require("../models/Postagem")
const Postagem = mongoose.model("postagens")
const {isAdmin} = require("../helpers/isAdmin")


router.get('/', isAdmin,(req, res) => {
    res.render("admin/index")
})
router.get('/posts', isAdmin, (req, res) => {

    res.send("Página de posts")
})
router.get('/categorias', isAdmin,(req, res) => {
    Categoria.find().sort({ date: 'desc' }).then((list) => {
        const context = {
            categorias: list.map(item => {
                return {
                    _id: item._id,
                    nome: item.nome,
                    slug: item.slug,
                    date: item.date
                }
            })
        }
        res.render("admin/categorias", { categorias: context.categorias })
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao listar as categorias.")
    })
})
router.get('/categorias/add', isAdmin,(req, res) => {

    res.render("admin/addcategorias")
})

router.post("/categorias/nova", isAdmin,(req, res) => {

    var erros = []

    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        erros.push({ text: "Nome inválido" })
    }

    if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
        erros.push({ text: "Slug inválido" })
    }

    if (req.body.nome.length < 2) {
        erros.push({ text: "Nome da categoria é muito pequeno." })
    }

    if (erros.length > 0) {
        res.render("admin/addcategorias", {
            erros: erros
        })
    } else {

        const novaCategoria = {
            nome: req.body.nome,
            slug: req.body.slug
        }

        new Categoria(novaCategoria).save().then(() => {
            req.flash("success_msg", "Categoria criada com sucesso!")
            res.redirect('/admin/categorias')
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao salvar a categoria, tente novamente!")
            res.redirect('/admin')
        }).catch((err) => {
        })
    }
})

router.get("/categorias/edit/:id", isAdmin,(req, res) => {
    Categoria.findOne({ _id: req.params.id }).then((categoria) => {
        const context = {
            categoria: {
                _id: categoria._id,
                nome: categoria.nome,
                slug: categoria.slug
            }
        }
        res.render("admin/editcategorias", { categoria: context.categoria })
    }).catch((err) => {
        req.flash("error_msg", "Esta categoria não existe", err)
        res.redirect('/admin/categorias')
    })
})

router.post("/categorias/edit", isAdmin,(req, res) => {
    Categoria.findOne({ _id: req.body.id }).then((categoria) => {
        categoria.nome = req.body.nome
        categoria.slug = req.body.slug

        categoria.save().then(() => {
            req.flash("success_msg", "Categoria editada com sucesso!")
            res.redirect('/admin/categorias')
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno ao salvar a edição da categoria", err)
            res.redirect('/admin/categorias')
        })
    }).catch((err) => {
        req.flash("error_msg", "Esta categoria não existe", err)
        res.redirect('/admin/categorias')
    })
})

router.post("/categorias/deletar", isAdmin,(req, res) => {
    Categoria.remove({ _id: req.body.id }).then(() => {
        req.flash("success_msg", "Categoria excluida com sucesso!")
        res.redirect('/admin/categorias')
    }
    ).catch((err) => {
        req.flash("error_msg", "Houve um erro ao deletar a categoria", err)
        res.redirect('/admin/categorias')
    })
})

router.get('/postagens', isAdmin,(req, res) => {
    Postagem.find().populate("categoria").sort({ data: 'desc' }).then((list) => {

        const context = {
            postagens: list.map(item => {
                return {
                    _id: item._id,
                    titulo: item.titulo,
                    slug: item.slug,
                    descricao: item.descricao,
                    conteudo: item.conteudo,
                    categoria: {
                        date: item.categoria.date,
                        _id: item.categoria._id,
                        nome: item.categoria.nome,
                        slug: item.categoria.slug,
                    },
                    data: item.data
                }
            })
        }

        res.render("admin/postagens", { postagens: context.postagens })
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao listar as postagens.")
        res.redirect("/admin")
    })
})

router.get('/postagens/add', isAdmin,(req, res) => {
    Categoria.find().sort({ date: 'desc' }).then((list) => {
        const context = {
            categorias: list.map(item => {
                return {
                    _id: item._id,
                    nome: item.nome,
                    slug: item.slug,
                    date: item.date
                }
            })
        }
        res.render("admin/addpostagens", { categorias: context.categorias })
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao carregar o formulário")
    })
})

router.post("/postagens/nova", isAdmin,(req, res) => {

    var erros = []

    if (req.body.categoria == "0") {
        erros.push({ texto: "Categoria inválida, registre uma categoria." })
    }

    if (erros.length > 0) {
        res.render("admin/addpostagem", { erros: erros })
    } else {
        const novaPostagem = {
            titulo: req.body.titulo,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria,
            slug: req.body.slug
        }

        new Postagem(novaPostagem).save().then(() => {
            req.flash("success_msg", "Postagem criada com sucesso!")
            res.redirect('/admin/postagens')
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro durante o salvamento da postagem", err)
            res.redirect('/admin/postagens')
        })
    }
})

router.get("/postagens/edit/:id", isAdmin,(req, res) => {

    Postagem.findOne({ _id: req.params.id }).then((postagem) => {
        Categoria.find().then((list) => {
            const context = {
                categorias: list.map(item => {
                    return {
                        _id: item._id,
                        nome: item.nome,
                        slug: item.slug,
                        date: item.date
                    }
                }),
                post: {
                    _id: postagem._id,
                    titulo: postagem.titulo,
                    slug: postagem.slug,
                    descricao: postagem.descricao,
                    conteudo: postagem.conteudo,
                    categoria: {
                        date: postagem.categoria.date,
                        _id: postagem.categoria._id,
                        nome: postagem.categoria.nome,
                        slug: postagem.categoria.slug,
                    },
                    data: postagem.data
                }
                //  postagem: {
                //       titulo: postagem.titulo,
                //     slug: postagem.slug,
                //     descricao: postagem.descricao,
                //      conteudo: postagem.conteudo
                //   }

            }

            res.render("admin/editpostagens", { categorias: context.categorias, postagem: context.post })
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao listar as categorias", err)
            res.redirect('/admin/postagens')
        })

    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao carregar o formulario de edição", err)
        res.redirect('/admin/postagens')
    })

})

router.post("/postagens/edit", isAdmin,(req, res) => {
    Postagem.findOne({ _id: req.body.id }).then((postagem) => {

        postagem.titulo = req.body.titulo
        postagem.slug = req.body.slug
        postagem.descricao = req.body.descricao
        postagem.conteudo = req.body.conteudo
        postagem.categoria = req.body.categoria

        postagem.save().then(() => {
            req.flash("success_msg", "Postagem editada com sucesso!")
            res.redirect("/admin/postagens")
        }).catch((err) => {
            req.flash("error_msg", "Erro interno", err)
            res.redirect('/admin/postagens')
        })


    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao salvar a edição", err)
        res.redirect('/admin/postagens')
    })
})

router.get("/postagens/deletar/:id", isAdmin,(req, res) => {
    Postagem.remove({ _id: req.params.id }).then(() => {
        req.flash("error_msg", "Postagem deletada com sucesso!", err)
        res.redirect("/admin/postagens")
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro interno", err)
        res.redirect('/admin/postagens')
    })
})

module.exports = router