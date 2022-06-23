const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Postagem = new Schema({
    titulo:{
        type: String,
        require: true
    },
    slug:{
        type: String,
        required: true
    },
    descricao:{
        type: String, 
        required: true
    },
    conteudo:{
        type: String,
        required: true
    },
    categoria:{
        type: Schema.Types.ObjectId, //categoria vai armazenar o ID de algum objeto (id de uma categoria)
        ref: "categorias", //qual tipo de objeto
        required: true
    },
    data:{
        type: Date,
        default: Date.now()
    }
})

mongoose.model("postagens", Postagem) //definindo nosso model Postagem