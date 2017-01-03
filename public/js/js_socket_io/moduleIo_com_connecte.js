//			moduleIo_com_inscription.js

var sha256 = require('js-sha256'); 
var session = require('cookie-session'); // Charge le middleware de sessions
var Promise = require('promise');

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
					resolve();
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
exports.comCo = function(socket, app){

	socket.on('deconnexion', function(monPseudo) {
		console.log('deconnexion ' + monPseudo);
		supprJoueur(monPseudo).then(function(){
			socket.broadcast.emit('majListJoueurs', session.joueursConnectes);
				require("../js_bdd.js").getIdPartieActiveD1J(monPseudo)
					.then(idP => {
						if(idP == -1){	console.log(monPseudo + " n'avait pas de partie lancée par lui-même");	}
						else{	socket.broadcast.emit('annulationPartie', idP); console.log("la partie n° " + idP + " créee par " + monPseudo + " va être supprimée.");	}
							require("../js_bdd.js").annulerUnePartie(idP)
								.then(function(){	console.log(monPseudo + " avait une partie en lancée. Annulée : " + idP);	})
								.catch(err => {	console.log('socket.on(deconnexion annulerUnePartie /  catch : ' + err);	});
					}).catch(err => {	console.log('socket.on(deconnexion getIdPartieActiveD1J /  catch : ' + err);	});
		}).catch(err => {	console.log('socket.on(deconnexion supprJoueur /  catch  /  error : ' + err);	});});
	
	socket.on('getListJoueurs', function(pseudoNouveau) {
		console.log('envoi majListJoueurs');
		socket.broadcast.emit('majListJoueurs', session.joueursConnectes);
	});
	socket.on('getMoiJoueur', function(pseudo) {
		require('../js_bdd.js').getJoueurFromPseudo(pseudo)
			.then(joueur => {
				session.socketId[joueur.id] = socket.id;
				console.log('test socket id : ' + session.socketId[joueur.id] + " - " + session.socketId[4]);
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
						session.parties.push(partie);
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
	socket.on('getListParties', function(mess){  // mess= "pleaze ! "
// va en réalité renvoyer un objet data !!
		/*
				var data = {
					listParties = session.parties,
					Inscrits = aDefinir  //  Inscrits = [{ id1 , id2}, { id3 , id2}] .Ect (les index coïncidant avec session.parties)
				};
		*/
		console.log("demande de liste reçue");
	//	socket.emit('listParties', session.parties);
		require('../js_bdd.js').getIdInscritsAUnePartieFromIdPartie(51)
			.then( listeDIdInscrits => {
				console.log("then de lesInscritsPromise : " + listeDIdInscrits);
			}).catch(err => {
				console.log('socket.on getListParties / catch : ' + err); return reject(err);
			});
	});
}
function envoyerMessTabIdsMembres(tabIdMembres, sujetMess, valeurMess)
{
	tabIdMembres.forEach(function(idJ){
		socket(session.socketId[idJ]).emit(sujetMess, valeurMess);
	})
}
exports.envoyerMessTabIdsMembres = envoyerMessTabIdsMembres;