//Carregando módulos
const express = require('express')
const handlebars = require('express-handlebars')
const bodyParser = require("body-parser")
const mongoose = require('mongoose')
const app = express()
const admin = require('./routers/admin')
const path = require("path")
const session = require("express-session")
const flash = require("connect-flash")

//Configurações
    //Sessão
    app.use(session({
        secret:"cursodenode",
        resave: true,
        saveUninitialized:true
    }))
    app.use(flash())
    //Middleware
    app.use((req, res, next) => {
        res.locals.success_msg = req.flash("success_msg")
        res.locals.error_msg = req.flash("error_msg")
        next()
    })
    //Body Parser
    app.use(bodyParser.urlencoded({extended: true}))
    app.use(bodyParser.json())
    // Handlebars
    app.engine('handlebars', handlebars({defaultLayout: 'main'}))
    app.set('view engine','handlebars')
    //Mongoose
    mongoose.connect("mongodb://localhost/blogapp").then(()=>{
        console.log("Conectado ao mongo")
    }).catch((err) =>{
        console.log("Erro ao se conectar: "+err)
    }
    )
    //Public
    app.use(express.static(path.join(__dirname,"public")))


//Rotas

app.use('/admin', admin)


//Outros

const PORT = 8082

app.listen(PORT, () => {
    console.log("Servidor rodando! ")
})