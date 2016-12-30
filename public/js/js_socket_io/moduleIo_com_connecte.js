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
function supprPartie(idPartieASuppr) // suppression de la liste des parties de session + setAnnuler en status
{
	return new Promise(function(resolve, rejected){
		var monIndex = -1;
		var compteur = 0;
		idPartieASuppr = parseInt(idPartieASuppr);

		session.parties.forEach(function(partie){
			if(jpartie.id == idPartieASuppr)
			{
				monIndex = compteur;
			}
			compteur ++;
		})
		if(monIndex != -1){ 
			session.parties.splice(monIndex, 1);
			resolve();
		}
		else { 
			console.log("else splice");
			reject(-1);	}
	 });
}
exports.comCo = function(socket, app){//, pseudoNouveauJ){

	

	socket.on('deconnexion', function(monPseudo) {
		console.log('deconnexion');
		supprJoueur(monPseudo).then( function(){
			socket.broadcast.emit('majListJoueurs', session.joueursConnectes);
		}).catch(err => {
			console.log('supprJoueur /  catch  /  error : ' + err);
		});
	/*	socket.broadcast.emit('majListJoueurs', session.joueursConnectes);
		session.joueursConnectes.forEach(function(un){
			console.log('socket on deconnexion ; ' + un.pseudo + un.password);*/
	//	})
		
	});
	socket.on('jarrive', function(pseudoNouveau) {
		socket.broadcast.emit('majListJoueurs', session.joueursConnectes);
	});
	socket.on('getMoiJoueur', function(pseudo) {
		require('../js_bdd.js').getJoueurFromPseudo(pseudo)
			.then(joueur => {
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
/*
		var lesInscritsPromise = new Promise(function(resolve, reject){
			session.parties.forEach(function(partie){
			require('../js_bdd.js').getIdInscritsAUnePartieFromIdPartie(partie.id)
				.then( listeDIdInscrits => {
					console.log("then de lesInscritsPromise : " + listeDIdInscrits);
					//list.push(listeDIdInscrits);
					return resolve(list);
				}).catch(err => {
					console.log('socket.on getListParties / catch : ' + err); return reject(err);
				});
			})
		});
		lesInscritsPromise
			.then(listInscr => {
				console.log('ijiiij');
				var donnees = {
				list2Parties : session.parties,
				listDInscrits: listInscr // listInscr[O] sera la liste des inscrits de session.parties[0]
				};
				console.log("avant emission, donnees['list2Parties'].length :\n" + donnees['list2Parties'].length
	+ ", et donnees['listDInscrits'].length" + donnees['listDInscrits'].length);
				socket.emit('listParties', donnees);
			}).catch(err => {
				console.log('socket.on getListParties / 2ème catch : ' + err); return reject(err);
			});
/*
		var list = [];
		var lesInscritsPromise = new Promise(function(resolve, reject){
			session.parties.forEach(function(partie){
			require('../js_bdd.js').getIdInscritsAUnePartieFromIdPartie(partie.id)
				.then( listeDInscrits => {
					list.push(listeDInscrits);
					return resolve(list);
				}).catch(err => {
					console.log('socket.on getListParties / catch : ' + err); return reject(err);
				});
			})
		});
		lesInscritsPromise
			.then(listInscr => {
				var donnees = {
				list2Parties : session.parties,
				listDInscrits: listInscr // listInscr[O] sera la liste des inscrits de session.parties[0]
				};
				console.log("avant emission, donnees['list2Parties'].length :\n" + donnees['list2Parties'].length
	+ ", et donnees['listDInscrits'].length" + donnees['listDInscrits'].length);
				socket.emit('listParties', donnees);
			}).catch(err => {
				console.log('socket.on getListParties / 2ème catch : ' + err); return reject(err);
			});	*/
	});

}