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
/*session.socket.forEach(function(socketValue, cle){
	if(cle  == row['id'])
	{
		monIndex = compteur;
		console.log('suppr socketClient trouvé, cle : ' + cle + ", row.id : " + row['id'])
	}
	compteur ++;
})*/
			//	if(monIndex != -1){ 
					session.socket.splice(row['id'], 1);
					resolve(1);
			//	}
				/*else { 
					console.log("else supprJoueurListSockets");
					reject(-1);
				}*/
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
exports.comCo = function(socket, app){
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
					socket.broadcast.emit('annulationPartie', idPart);
					console.log("partie  #" + idPart + " annulée : ");

	console.log("resolve	onDecoJoueurGererSesParties : OK " + idPart);
					return resolve(idPart);	
				})
				.catch(err => {	console.log('err annulerUnePartie dans onDecoJoueurGererSesParties : ' + err); socket.broadcast.emit('annulationPartie', idPart); return reject(err);	});	
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
		socket.broadcast.emit('majListJoueurs', session.joueursConnectes);
	});
	socket.on('majMyParties', function() {
		socket.emit('majMyParties', session.parties);
	});
	socket.on('initClient', function() {
console.log('envoi initClient, nb joueurs : ' + session.joueursConnectes.length + ", nb parties : " + session.parties.length);
		socket.emit('initClient', {joueurs: session.joueursConnectes, parties: session.parties});
		socket.broadcast.emit('majListJoueurs', session.joueursConnectes);
	});
	socket.on('getMoiJoueur', function(pseudo) {
		require('../js_bdd.js').getJoueurFromPseudo(pseudo)
			.then(joueur => {
				console.log("recup socket id : " + socket.id);
			
				session.socket[joueur.id] = socket;
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
						require('../js_bdd.js').inscrireJoueurAPartie(idLanceur, partie.id)
							.then(function(){
console.log("création partie OK sur socket.on('nouvellePartie',");
								socket.emit('votreNouvellePartie' , partie);
								socket.broadcast.emit('nouvellePartie', partie);
							})
							.catch(err => {	
								console.log('erreur inscrireJoueurAPartie dans création partie,  catch : ' + err); 
								reject(err);				
							});
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
				socket.emit('VotrePartieAnnulee', data['idPartie']);
				socket.broadcast.emit('annulationPartie', data['idPartie']);
			}).catch(err => {
				socket.emit('VotrePartieAnnulee', 'KO');
// attention le KO n'est pas correctgement traité
				socket.broadcast.emit('annulationPartie', data['idPartie']);
				console.log("partie  #" + idPartie + " IMPOSSIBLE à annuler : " + err);
		 });
	});
	socket.on('inscription', function(data){
console.log(data['idJ'] + " demande inscription à n° " + data['idP']);
		var inscriptible = true;
		/*session.parties.forEach(function(part){
			if(part.id == data['idP']){part.inscrits.forEach(function(idInscri){
							if(idInscri == data['idJ']){console.log(data['idJ'] + 'ce joueur est déjà inscrit à la partie n° ' + data['idP']);inscriptible = false;}
						})}
		})*/
		if(inscriptible)
		{
			require('../js_bdd.js').inscrireJoueurAPartie(data['idJ'], data['idP'])
				.then(function(){
					socket.emit('validInscr', data); // va sur le client venant de s'inscrire
					socket.emit('nouvelleInscrAUnePartie', data); 
					socket.broadcast.emit('nouvelleInscrAUnePartie', data); // à l'arrivée, un tri est opéré : lanceur traité différemment
console.log(data['idJ'] + " a bien été inscris à n° " + data['idP']);
				}).catch(err => {
					socket.emit('validInscrKO', data);
console.log("partie  #" + data['idP'] + " IMPOSSIBLE d'inscrire ce joueur : " + data['idP'] + " erreur : " + err);
			});
		}
//		else{socket.emit('validInscrKO', data);}		// A DEFINIR
	});
	socket.on('desinscription', function(data){
console.log('demande desincr de  ' + data['idJ'] + ', à partie : ' + data['idP']);
		require('../js_bdd.js').desinscrireJoueurDunePartie(data['idJ'], data['idP'])
			.then(function(){
console.log('desincr then');
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
	socket.on('getListParties', function(mess){  
		socket.emit('listParties', session.parties);
	});
}
function envoyerMessTabIdsMembres(tabIdMembres, sujetMess, valeurMess)
{
	tabIdMembres.forEach(function(idJ){
		socket(session.socketId[idJ]).emit(sujetMess, valeurMess);
	})
}
exports.envoyerMessTabIdsMembres = envoyerMessTabIdsMembres;