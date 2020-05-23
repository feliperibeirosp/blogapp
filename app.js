//Carregando módulos
const express = require('express')
const handlebars = require('express-handlebars')
const bodyParser = require("body-parser")
const mongoose = require('mongoose')
const app = express()
const admin = require('./routers/admin')
const usuarios = require('./routers/usuario')
const path = require("path")
const session = require("express-session")
const flash = require("connect-flash")
require("./models/Postagem")
const Postagem = mongoose.model("postagens")
require("./models/Categoria")
const Categoria = mongoose.model("categorias")
const passport = require('passport')
require("./config/auth")(passport)
const db = require("./config/db")

//Configurações
//Sessão
app.use(session({
    secret: "cursodenode",
    resave: true,
    saveUninitialized: true
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(flash())
//Middleware
app.use((req, res, next) => {
    res.locals.success_msg = req.flash("success_msg")
    res.locals.error_msg = req.flash("error_msg")
    res.locals.error = req.flash("error")
    res.locals.user = req.user || null;
    next()
})
//Body Parser
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
// Handlebars
app.engine('handlebars', handlebars({ defaultLayout: 'main' }))
app.set('view engine', 'handlebars')
//Mongoose
mongoose.connect(db.mongoURI).then(() => {
    console.log("Conectado ao mongo")
}).catch((err) => {
    console.log("Erro ao se conectar: " + err)
}
)
//Public
app.use(express.static(path.join(__dirname, "public")))


//Rotas

app.get('/', (req, res) => {
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

        res.render("index", { postagens: context.postagens })
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro interno")
        res.redirect("/404")
    })
})

app.get('/postagem/:slug', (req, res) => {
    Postagem.findOne({ slug: req.params.slug }).then((post) => {
        if (post) {
            const context = {
                postagem: {
                    _id: post._id,
                    titulo: post.titulo,
                    slug: post.slug,
                    descricao: post.descricao,
                    conteudo: post.conteudo,
                    categoria: {
                        date: post.categoria.date,
                        _id: post.categoria._id,
                        nome: post.categoria.nome,
                        slug: post.categoria.slug,
                    },
                    data: post.data
                }
            }
            res.render("postagem/index", context)
        } else {
            req.flash("error_msg", "Esta postagem não existe")
            res.redirect("/")
        }
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro interno")
        res.redirect("/")
    })
})

app.get("/categorias", (req, res) => {
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
        res.render("categorias/index", { categorias: context.categorias })
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro interno ao listar as categorias.")
        res.redirect("/")
    })
})

app.get("/categorias/:slug", (req, res) => {
    Categoria.findOne({ slug: req.params.slug }).then((categoria) => {
        if (categoria) {

            Postagem.find({ categoria: categoria._id }).then((list) => {

                context = {
                    postagens: list.map(item => {
                        return {
                            _id: item._id,
                            titulo: item.titulo,
                            slug: item.slug,
                            descricao: item.descricao,
                            conteudo: item.conteudo,
                            data: item.data
                        }
                    })
                }


                const categ = {
                    date: categoria.date,
                    _id: categoria._id,
                    nome: categoria.nome,
                    slug: categoria.slug,
                }


                res.render("categorias/postagens", { postagens: context.postagens, categoria: categ })
            }).catch((err) => {
                req.flash("error_msg", "Houve um erro ao lista os posts", err)
                res.redirect("/")
            })
        } else {
            req.flash("error_msg", "Esta categoria não existe")
            res.redirect("/")
        }
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro interno ao carregar a página desta categoria.")
        res.redirect("/")
    })
})

app.get('/404', (req, res) => {
    res.send("Erro 404!")
})


app.get('/posts', (req, res) => {
    res.send("Lista Posts")
})


app.use('/admin', admin)
app.use('/usuarios', usuarios)


//Outros

const port = process.env.PORT || 8082

app.listen(port, () => {
    console.log("Servidor rodando! ")
})