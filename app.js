/* Carregando Módulos */
    const express = require('express');
    const handlebars = require('express-handlebars');
    const bodyParser = require('body-parser');
    const app = express();
    const admin = require('./routes/admin'); //importando as rotas de routes/admin.js
    const path = require('path'); //módulo padrão do Node para trabalhar com diretórios e pastas
    const mongoose = require('mongoose');
    const session = require('express-session');
    const flash = require('connect-flash');
    require("./models/Postagem");
    const Postagem = mongoose.model("postagens");
    require("./models/Categoria");
    const Categoria = mongoose.model("categorias");
    const usuarios = require("./routes/usuario")
    const passport = require("passport");
    require("./config/auth")(passport);


/* Configurações */
    //Sessão 
        app.use(session({
            secret: "secretBemSegura=)",
            resave: true,
            saveUninitialized: true
        }))

        app.use(passport.initialize())
        app.use(passport.session())
        app.use(flash())

    //Middleware
        app.use(function(req, res, next){
            res.locals.success_msg = req.flash("success_msg") //variável global armazenando 'sucesso'
            res.locals.error_msg = req.flash("error_msg") //variável global armazenando 'error'
            res.locals.error = req.flash("error")
            res.locals.user = req.user || null //variavel 'user' vai armazenar os dados do usuario logado
            next()
        })

    //Body-Parser
        app.use(bodyParser.urlencoded({extended: true}))
        app.use(bodyParser.json())

    //HandleBars
        app.engine('handlebars', handlebars.engine({defaultLayout: 'main'}))
        app.set('view engine', 'handlebars')

    //Mongoose
        mongoose.Promise = global.Promise; //evitando alguns erros de configuração

        mongoose.connect('mongodb://localhost/blogapp').then(() => {
            console.log("Conectado ao MongoDB com sucesso!");
        }).catch((err) => {
            console.log("Erro ao se conectar com o banco: " + err)
        })

    //Public
        app.use(express.static(path.join(__dirname, 'public')))//falando para o express que a pasta com os arquivos staticos é a public

        app.use((req, res, next) => {
            console.log("Oi, eu sou um middleware")
            next()
        })


/* Rotas */
    app.get('/', (req, res) => {
        Postagem.find().lean().populate("categoria").sort({data:"desc"}).then((postagens) => {
            res.render("index", {postagens: postagens})
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno")
            res.redirect("/404")
        })
    })

    app.get('/postagem/:slug', (req,res) => {
        const slug = req.params.slug
        Postagem.findOne({slug})
            .then(postagem => {
                if(postagem){
                    const post = {
                        titulo: postagem.titulo,
                        data: postagem.data,
                        conteudo: postagem.conteudo
                    }
                    res.render('postagem/index', post)
                }else{
                    req.flash("error_msg", "Essa postagem nao existe")
                    res.redirect("/")
                }
            })
            .catch(err => {
                req.flash("error_msg", "Houve um erro interno")
                res.redirect("/")
            })
    })

    app.get("/categorias", (req, res) => {
        Categoria.find().lean().then((categorias) => {
            res.render("categorias/index", {categorias: categorias})
        }).catch((err) => {
            req.flash("error_msg", "Erro interno ao listar as categorias")
            res.redirect("/")
        })
    })

    app.get("/categorias/:slug", (req, res) => {
        Categoria.findOne({slug: req.params.slug}).lean().then((categorias) => {
            if(categorias){
                Postagem.find({categoria: categorias._id}).lean().then((postagens) => {
                    res.render("categorias/postagens", {postagens: postagens, categoria: categorias})
                }).catch((err) => {
                    req.flash("error_msg", "Houve um erro ao listar os posts")
                    res.redirect("/")
                })
            }else{
                req.flash("error_msg", "Esta categoria não existe")
                console.log("oiaaaaaaaaaaa")
                res.redirect("/")
            }
        }).catch((err) => {
             console.log(err)
            req.flash('error_msg', "Houve um erro interno ao carregar a página dessa categoria")
            res.redirect("/")
        })
    })
    
    app.get("/404", (req, res) => {
        res.send("Erro 404!")
    })

    //prefixo /admin, rotas importadas do admin.js
    app.use('/admin', admin)

    //prefixo /usuarios, rotas importadas do usuarios.js
    app.use('/usuarios', usuarios)


/* Servidor */
    const PORT = 8081
    app.listen(PORT, function(){
        console.log("Servidor rodando...")
    })