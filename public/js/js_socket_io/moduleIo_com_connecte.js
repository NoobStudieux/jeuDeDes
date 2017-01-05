//			moduleIo_com_inscription.js

var sha256 = require('js-sha256'); 
var session = require('cookie-session'); // Charge le middleware de sessions
var Promise = require('promise');

function isJoueurConnecte(pseudo)
{
	return new Promise(function(resolve, reject){
		var isJCo = false;
		session.joueursConnectes.forEach(function(joueur){
			if(joueur.pseudo == pseudo){	isJCo = true;}
		})
		return resolve(isJCo);
	});
}
exports.isJoueurConnecte = isJoueurConnecte;
function supprJoueurListJoueurs(pseudoDeco)
{
	return new Promise(function(resolve, rejected){
		var monIndex = -1;
		var compteur = 0;
// suppression du jouuer de la liste joueur
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
			console.log("else supprJoueurListJoueurs");
			reject(-1);	}
	 });
}
function supprJoueurListSockets(pseudoDeco)
{
	return new Promise(function(resolve, rejected){
		require('../js_bdd.js').getInfosJoueur(pseudoDeco)
			.then(row => {
				var monIndex = -1;
				var compteur = 0;
		// suppression du jouuer de la liste joueur
				session.socketId.forEach(function(socketValue, cle){
					if(cle  == row['id'])
					{
						monIndex = compteur;
						console.log('suppr socketClient trouvé, cle : ' + cle + ", row.id : " + row['id'])
					}
					compteur ++;
				})
				if(monIndex != -1){ 
					session.socketId.splice(monIndex, 1);
					resolve(1);
				}
				else { 
					console.log("else supprJoueurListSockets");
					reject(-1);
				}
			}).catch(err => {
				console.log(' catch supprJoueurListSockets : ' + err);
				return reject(err);
			});
	});		
}
function supprJoueur(pseudoDeco) // suppression de la liste des joueurs connects && listSockets
{		// fait appel aux 2 fonctions ci-dessus
	return new Promise(function(resolve, rejected){
		supprJoueurListJoueurs(pseudoDeco)
			.then(function(){
				supprJoueurListSockets(pseudoDeco)
					.then(function(){
						console.log(pseudoDeco + ' a correctement quitté la session (supprJoueur).');
						return resolve();
					}).catch(err => {
						console.log(pseudoDeco + ' ERR quitté la session. catch supprJoueurListSockets' + err);
						return reject();
					});
			}).catch(err => {
				console.log(pseudoDeco + ' ERR quitté la session. catch supprJoueurListJoueurs : ' + err);
				return reject();
			});
	 });
}
function supprPartie(idPartieASuppr) // suppression de la liste des parties de session + setAnnuler en status
{
	return new Promise(function(resolve, rejected){
		var monIndex = -1;
		var compteur = 0;
		idPartieASuppr = parseInt(idPartieASuppr);

		session.parties.forEach(function(partie){
			if(partie.id == idPartieASuppr)
			{
				monIndex = compteur;
			}
			compteur ++;
		})
		if(monIndex != -1){ 	session.parties.splice(monIndex, 1);	return resolve(1);	}
		else { 	console.log("else splice , monIndex " + monIndex + ", compteur : " + compteur); 	return reject(-1);	}
	 });
}
exports.supprPartie = supprPartie;
function onDecoJoueurGererSesParties(idJ)
{
console.log("n° " + idJ + " se déconnecte .. " + session.parties.length);
	return new Promise(function(resolve, reject){
		var isLanceur = false, indexPartieConcernee = -1, compteur = 0;
		session.parties.forEach(function(p){
// est il lanceur d'une partie
			if(p.idLanceur == idJ){	isLanceur = true;	indexPartieConcernee = compteur;	} 
			compteur ++;
		})
		if(isLanceur){	console.log(idJ + " est le lanceur d'une partie : n°" + session.parties[indexPartieConcernee].id);
require('../js_bdd.js').annulerUnePartie(session.parties[indexPartieConcernee].id)  // lanceur oui ? annulationPartie
			.then(idPart =>	{	
				
console.log("resolve	onDecoJoueurGererSesParties : OK " + idPart);
				return resolve(idPart);	
			/*	supprPartie(session.parties[indexPartieConcernee].id)
					.then(function(){console.log("partie supprimée");	return resolve(1);	
					}).catch(err => {	console.log('err supprpARTIE dans onDecoJoueurGererSesParties : ' + err); return reject(err);	});
		*/	})
			.catch(err => {	console.log('err annulerUnePartie dans onDecoJoueurGererSesParties : ' + err); return reject(err);	});	
		}
		else{ // sinon est-il inscrit ?
			compteur = 0; var isInscrit = false;
			session.parties.forEach(function(p){
				p.inscrits.forEach(function(idInscr){
console.log("itération inscrits dans inscr, idInscr : " + idInscr + ", idJ : " + idJ);
					if(idInscr == idJ){		indexPartieConcernee = compteur; isInscrit = true;	}
				})
				compteur ++;
			})
			if(isInscrit){ console.log("inscris  OK : ");
				require('../js_bdd.js').desinscrireJoueurDunePartie(idJ, session.parties[indexPartieConcernee].id)
									.then(function(){	console.log("désinscription OK");
										return resolve(-1);	})
									.catch(err => {	console.log('err desinscrireJoueurDunePartie dans onDecoJoueurGererSesParties : ' + err); return reject(err);	});
			}
			else{	console.log("joueur inscris nul part"); return resolve(-1);	}
		}
	});	
}
exports.comCo = function(socket, app){
	socket.on('deconnexion', function(idJoueur) {
console.log("deconnexion de n°" + idJoueur);		
		onDecoJoueurGererSesParties(idJoueur)
			.then(idPart => {  
if(idPart != -1) {	socket.broadcast.emit('annulationPartie', idPart);	}
console.log("onDecoJoueurGererSesParties OK");	
				require('../js_bdd.js').getJoueurFromId(idJoueur)
					.then(j => {
						supprJoueur(j.pseudo)
							.then(function(){
								socket.broadcast.emit('majListJoueurs', session.joueursConnectes);
								console.log("supprJoueur " + j.pseudo + " OK, nb j restants  : " + session.joueursConnectes.length);
							}).catch(err => { console.log("socket.on('deconnexion' catch de supprJoueur (le 2ème) : " + err); 
						});
					}).catch(err => { console.log("socket.on('deconnexion' catch de getJoueurFromId : " + err); });
			}).catch(err => { console.log("socket.on('deconnexion' catch de onDecoJoueurGererSesParties : " + err); 
		});
	});
	socket.on('getListJoueurs', function(pseudoNouveau) {
console.log('envoi majListJoueurs, nb : ' + session.joueursConnectes.length);
		socket.broadcast.emit('majListJoueurs', session.joueursConnectes);
	});
	socket.on('getMoiJoueur', function(pseudo) {
		require('../js_bdd.js').getJoueurFromPseudo(pseudo)
			.then(joueur => {
				console.log("recup socket id : " + socket.id);
			
				session.socket[joueur.id] = socket;
/*// test
setInterval(function(){
	session.joueursConnectes.forEach(function(j){
		message = "socket du joueur : " + j.id + " - " + j.pseudo + ", socket : " + session.socket[j.id].id;
		console.log("envoi mess test socket : \n : " + message);
		session.socket[j.id].emit('testSocket', message);
	//	socket.emit('testSocket', message);
	})
			}, 6500);
// test */


			//	console.log('test socket id : ' + session.socketId[joueur.id] + " - " + session.socketId[4]);
				socket.emit('votreJoueur', joueur);
			}).catch(err =>{
				console.log("err socket.on getMoiJoueur /catch  creationPartie : " + err);
			});
	});
	socket.on('nouvellePartie', function(data){
		require('../js_objets/js_joueur.js').idFromPseudo(data['pseudo'])
			.then(idLanceur => {
				require('../js_bdd.js').creationPartie(idLanceur, data['jeu'].trim())
					.then(partie =>{
						socket.emit('votreNouvellePartie' , partie);
						socket.broadcast.emit('nouvellePartie', partie);
					}).catch(err =>{
						console.log("err socket.on creationPartie /catch  creationPartie : " + err);
					}).catch(err =>{
						console.log("err socket.on creationPartie / catch idFromPseudo : " + err);
					});
			});
	});
	socket.on('annulerMaPartie', function(data){
		console.log(data['pseudo'] + " demande l'annulation de sa partie , id : " + data['idPartie']);
		require('../js_bdd.js').annulerUnePartie(data['idPartie'])
			.then(function(){
				socket.emit('VotrePartieAnnulee', 'OK');
				socket.broadcast.emit('annulationPartie', data['idPartie']);
			}).catch(err => {
				socket.emit('VotrePartieAnnulee', 'KO');
				socket.broadcast.emit('annulationPartie', data['idPartie']);
				console.log("partie  #" + idPartie + " IMPOSSIBLE à annuler : " + err);
		 });
	});
	socket.on('inscription', function(data){
		require('../js_bdd.js').inscrireJoueurAPartie(data['idJ'], data['idP'])
			.then(function(){
				socket.emit('validInscr', data);
				socket.broadcast.emit('nouvelleInscrAUnePartie', data);
			}).catch(err => {
				socket.emit('validInscrKO', data);
				console.log("partie  #" + data['idP'] + " IMPOSSIBLE d'inscrire ce joueur : " + data['idP'] + " erreur : " + err);
		 });
	});
	socket.on('desinscription', function(data){
		require('../js_bdd.js').desinscrireJoueurDunePartie(data['idJ'], data['idP'])
			.then(function(){
				socket.emit('validDesinscr', data);
				socket.broadcast.emit('nouvelleDesinscrAUnePartie', data);
			}).catch(err => {
				socket.emit('validInscrKO', data);
				console.log("partie  #" + data['idP'] + " IMPOSSIBLE de desinscrire ce joueur : " + data['idP'] + " erreur : " + err);
		 });
	});
	socket.on('pbNonGere', function(mess){
		console.log("pbNonGere : " + mess);
	});
// que pour le dev ! 
	socket.on('testMySocket', function(idJ){
		message = "socket du joueur : " + idJ + " - , socket : " + session.socket[idJ];
		console.log("envoi mess test socket : \n : " + message);
		session.socket[idJ].emit('testSocket', message);
	});
	socket.on('getListParties', function(mess){  // mess= "pleaze ! "
// va en réalité renvoyer un objet data !!
		/*
				var data = {
					listParties = session.parties,
					Inscrits = aDefinir  //  Inscrits = [{ id1 , id2}, { id3 , id2}] .Ect (les index coïncidant avec session.parties)
				};
		*/
		console.log("demande de liste reçue");
		socket.emit('listParties', session.parties);
		/*require('../js_bdd.js').getIdInscritsAUnePartieFromIdPartie(51)
			.then( listeDIdInscrits => {
				console.log("then de lesInscritsPromise : " + listeDIdInscrits);
			}).catch(err => {
				console.log('socket.on getListParties / catch : ' + err); return reject(err);
			});*/
	});
}
function envoyerMessTabIdsMembres(tabIdMembres, sujetMess, valeurMess)
{
	tabIdMembres.forEach(function(idJ){
		socket(session.socketId[idJ]).emit(sujetMess, valeurMess);
	})
}
exports.envoyerMessTabIdsMembres = envoyerMessTabIdsMembres;