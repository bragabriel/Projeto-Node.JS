module.exports = {
    eAdmin: function(req, res, next){

        console.log("entrou")
        if(req.isAuthenticated() && req.user.eAdmin == 1){
        //                          eAdmin do model User
            return next();
        }
        
        req.flash('error_msg', "Você deve ser administrador para acessar essa página!")
        res.redirect("/")
    }
}