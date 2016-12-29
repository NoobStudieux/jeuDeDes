var express = require('express');
var session = require('cookie-session'); // Charge le middleware de sessions
var bodyParser = require('body-parser'); // Charge le middleware de gestion des paramètres
var urlencodedParser = bodyParser.urlencoded({ extended: false });
var ent = require('ent');
var http = require('http');
var cookieParser = require('cookie-parser');

var app = express();
app.use(cookieParser());
app.use(bodyParser.json()).use(bodyParser.urlencoded({extended: true}));//.use(cookieParser);

session.joueursConnectes = [];

require('./public/js/js_bdd.js').checkDB();

// !!! Il faut impérativement utiliser cookie-parser avant cookie session !!! // 
app.set('view engine', 'ejs');
// On utilise les sessions 
app.use(session({secret: 'todotopsecret'}))
//	.use(express.static(__dirname + '/public')) // ne suffit pas
    .get('/', function(req, res) { 
			res.render('pages/accueil.ejs');
	})
	.post('/connecte', function(req, res){
		var credentials = {		"pseudo": req.body.pseudo, "password": req.body.password		};

		require('./public/js/js_bdd.js').idsVerif(credentials, function(connecOK){
				if(connecOK)
				{
					require('./public/js/js_objets/js_joueur.js').joueurFromPseudo(credentials['pseudo'])
						.then(joueur => {
							session.joueursConnectes.push(joueur);
							console.log("session.joueursConnectes " + session.joueursConnectes.length ) ;
							res.render('pages/Connecte.ejs', { 		joueur:credentials['pseudo'], joueurs: session.joueursConnectes	} );
					}).catch(err => {
						res.send("erreurs : "+ err);
					});
					//console.log("app connecte : " + credentials)
					}
				else{
					res.render('pages/pasConnecte.ejs'); //devrait ne jamais arriver
				}
		})
	})
	.get('/public/jquery/jquery-3.1.1.js', function(req, res){
			res.sendFile(__dirname + '/public/jquery/jquery-3.1.1.js');
	})
	.get('/public/css/style_arcade.css', function(req, res){
			res.sendFile(__dirname + '/public/css/style_arcade.css');
	})
	.get('/public/bootstrap/css/bootstrap.min.css', function(req, res){
			res.sendFile(__dirname + '/public/bootstrap/css/bootstrap.min.css');
	})
	.get('/public/bootstrap/js/bootstrap.js', function(req, res){
			res.sendFile(__dirname + '/public/bootstrap/js/bootstrap.js');
	})
	.get('/public/js/js_inscription/module_inscription.js', function(req, res){
			res.sendFile(__dirname + '/public/js/js_inscription/module_inscription.js');
	})
	.get('/public/js/js_pages/js_accueil.js', function(req, res){
			res.sendFile(__dirname + '/public/js/js_pages/js_accueil.js');
	})
	.get('/public/js/js_pages/js_connecte.js', function(req, res){
			res.sendFile(__dirname + '/public/js/js_pages/js_connecte.js');
	})
// On redirige vers root si la page demandée n'est pas trouvée 
	.use(function(req, res, next){
			res.redirect('/');
	 });
	
var server = http.createServer(app);

require('./public/js/js_socket_io/main_moduleIo_communication.js').loadIoModules(server);

server.listen(8080);