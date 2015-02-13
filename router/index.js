module.exports = function (app) {
    require('./train')(app);
    require('./pages')(app);
    require('./user')(app);
    require('./entries')(app);
    require('./categories')(app);
    require('./predict')(app);
    app.get('*', function(req, res){
        res.render('errors/404.ejs', {data: "Oops ... 404"});
    });
    console.log("finished loading routes");
};