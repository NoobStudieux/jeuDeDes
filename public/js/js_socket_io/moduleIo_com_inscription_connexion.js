//			moduleIo_com_inscription.js

var session = require('cookie-session'); // Charge le middleware de sessions
var sha256 = require('js-sha256');

function inscription(infos)
{
	var connexion = require('../module_connexion.js').connexion();
	connexion.connect();

	var t = new Date();
	//			2016-12-23 10:30:34
	var dateFormatee = t.getFullYear() + "-" + (t.getMonth() + 1) + "-" + t.getDate() + 
	" " + t.getHours() + ":" + t.getMinutes() + ":" + t.getSeconds();
	
	var donnees  = {
			pseudo: infos['pseudo'],
			password: sha256(infos['password']),
			mail: infos['mail'], 
			points: 0, 
			date_inscr: dateFormatee, 
			date_last: dateFormatee
		};
	var query = connexion.query("INSERT INTO membres SET ?", donnees, function(err, result) {
  // Neat!
			if(err){		console.log('erreur lors de l\'insertion : ' + err);  }
			else{		console.log('insertion OK');  }	
	});
	query.on('error', function(err) {
    // Handle error, an 'end' event will be emitted after this as well
		console.log('erreur ors de l\'insertion : ' + err);
	});
	connexion.end(function(){});
}
exports.comInscr = function(socket){

	console.log('function io inscription');
	socket.on('isDispoPseudo', function(pseudo) {
			var pseudoOK = require('../js_bdd.js').dispoPseudo(pseudo, function(pseudoOK){
				console.log("recep isDispoPseudo" + pseudo)
					if(pseudoOK)
					{
						socket.emit('isDispoPseudo', true);
					}
					else{	  socket.emit('isDispoPseudo', false);		}
				});
		});
		socket.on('isMailDispo', function(mail) {
			var pseudoOK = require('../js_bdd.js').dispoMail(mail, function(mailOK){
					if(mailOK)
					{
						socket.emit('isMailDispo', true);
					}
					else{	  socket.emit('isMailDispo', false);		}
				});
		});
		socket.on('infosCompte', function(infosCompte) {
			var connexion = require('../module_connexion.js').connexion();
			connexion.connect();
			var rapportErr = "";
			var thatsOK = true;
				
			connexion.query("SELECT * FROM membres", function(err, rows, fields) {
				if (err) throw err;
				
				rows.forEach(function(un){
					if(un.pseudo == infosCompte['pseudo'])
					{
						thatsOK = false;
						rapportErr = "inscription non réalisée : pseudo déjà pris";
					}
					if(un.mail == infosCompte['mail'])
					{
						thatsOK = false;
						rapportErr = "inscription non réalisée : mail déjà pris";
					}
				});
			});
			connexion.end(function(err){
				var tabReponse = {
					"inscrOK": thatsOK,
					"rapport": rapportErr
				};
				if(thatsOK)
				{
					inscription(infosCompte);
					socket.emit('isInscrOK', 'inscription réalisée');
					var objetMail = "confirmation d'inscription à mon site";
					var corpsMail = "Bonjour, je vous annonce par la présente que vous êtes désormais inscris sur mon site en construction. \nAccessible à cette adresse :  <a href='localhost:8080'>localhost:8080</a>. \n Rappel pseudo : " + infosCompte['pseudo'] + ",\nMot de passee : " + infosCompte['password'] + "\n$$tay tune !";
					require('../module_mailing.js').mailIt(infosCompte['mail'], objetMail, corpsMail);
					
				}else{
					socket.emit('isInscrOK', 'inscription impossible');
				}
			});
		});
		socket.on('credentials', function(credentials) {
// vérification effectuée à nouveau sur .post(/connecte) (app.js)
			require('../js_bdd.js').idsVerif(credentials)
				.then(thatsOK => {
					if(thatsOK)
					{
						require('./moduleIo_com_connecte.js').isJoueurConnecte(credentials['pseudo'])
							.then(isJCo => {
								if(isJCo)
								{
									socket.emit('errConnec', 'Erreur de connection : ce membre est déjà connecté');
								}
								else{
									socket.emit('ConnecOk', 'connection autorisée');
							}}).catch(err => {	
								console.log("socket.on('credentials' catch isJoueurConnecte :" + err);		
								socket.emit('errConnec', 'Erreur de connection indeterminée');
							});
					}
					else{	socket.emit('errConnec', 'Erreur de connection : veuillez vérifier Vos identifiants et mot de passe.');	}
				}).catch(err => {	
								console.log("socket.on('credentials' catch idsVerif :" + err);		
								socket.emit('errConnec', 'Erreur de connection indeterminée');
				});
	});
}