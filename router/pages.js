console.log("--loading root routes");

module.exports = function(app){

    app.get('/', function (req, res) {
        res.render('pages/index');
    });    
    
    app.get('/pages/test', function(req, res){
        res.render('pages/test');
    });
};