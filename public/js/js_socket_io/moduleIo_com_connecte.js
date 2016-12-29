//			moduleIo_com_inscription.js

var sha256 = require('js-sha256'); 
var session = require('cookie-session'); // Charge le middleware de sessions
var Promise = require('promise');

function supprJoueur(pseudoDeco) // suppression de la liste des joueurs connects
{
	return new Promise(function(resolve, rejected){
		var monIndex = -1;
		var compteur = 0;

		session.joueursConnectes.forEach(function(joueur){
			if(joueur.pseudo.trim() == pseudoDeco.trim())
			{
				monIndex = compteur;
			}
			compteur ++;
		})
		if(monIndex != -1){ 
			session.joueursConnectes.splice(monIndex, 1);
			resolve();
		}
		else { 
			console.log("else splice");
			reject(-1);	}
	 });
	

		
}
exports.comCo = function(socket){//, pseudoNouveauJ){

	socket.on('deconnexion', function(pseudoDeco) {
		console.log('socket on deconnexion ; ');
		supprJoueur(pseudoDeco).then( function(){
			socket.broadcast.emit('majListJoueurs', session.joueursConnectes);
			session.joueursConnectes.forEach(function(un){
			console.log('socket on deconnexion ; ' + un.pseudo + un.password);
			})
			console.log( ",  session.joueursConnectes : ");
			

		}).catch(err => {
			console.log('supprJoueur /  catch  /  error : ' + err);
		});
	/*	socket.broadcast.emit('majListJoueurs', session.joueursConnectes);
		session.joueursConnectes.forEach(function(un){
			console.log('socket on deconnexion ; ' + un.pseudo + un.password);*/
	//	})
		
	});
	socket.on('jarrive', function(pseudoNouveau) {
	//	session.joueursConnectes.push(pseudoNouveau);
		socket.broadcast.emit('majListJoueurs', session.joueursConnectes);
		console.log('socket on jarrive ; liste : ');
		session.joueursConnectes.forEach(function(j){
			console.log(j.pseudo);
		})
	});
	socket.on('nouvellePartie', function(data) {
		var partie = [];
		socket.broadcast.emit('nouvellePartie', partie);
	});
}