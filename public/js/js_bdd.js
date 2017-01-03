/*
		Avec /public/js/js_Manager.js, ce sont les 2 seuls fichiers pouvant toucher / accéder à la bdd
*/
var session = require('cookie-session');
var Promise = require('promise');

exports.checkDB = function()
{
/*
		Vérification de l'existence des tables (et création sinon): 
			- membres
			- parties
			- correspondances
*/
	var connexion = require('./module_connexion.js').connexion();
	connexion.connect();

	var checkTables = new Promise(function(resolve, reject){
		connexion.query(`CREATE TABLE IF NOT EXISTS membres(
		
			id SMALLINT UNSIGNED UNIQUE NOT NULL AUTO_INCREMENT,
			pseudo VARCHAR(14) UNIQUE NOT NULL,
			password VARCHAR(70) NOT NULL,
			mail VARCHAR(100) UNIQUE NOT NULL,
			points INT(10),
			date_inscr DATETIME NOT NULL,
			date_last DATETIME NOT NULL,
			PRIMARY KEY ( id )	
		)
		ENGINE=INNODB`, function(err, result) {
				if(err){		console.log('erreur avec table membres : ' + err);  }
				else{		console.log('table membres OK');  }	
		});

	// il faudra également annuler les parties lancées à la session précédentes, ou les effacer.

		query = connexion.query(`CREATE TABLE IF NOT EXISTS parties(
		
			id SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
			etat VARCHAR(8) NOT NULL,
			jeu VARCHAR(20) NOT NULL,
			idLanceur SMALLINT UNSIGNED NOT NULL,
			date_creation DATETIME NOT NULL,
			date_fin DATETIME NOT NULL,
			idVainqueur SMALLINT UNSIGNED NOT NULL,
			PRIMARY KEY ( id ),
			INDEX ind_idVainqueur(idVainqueur),
			INDEX ind_idLanceur(idLanceur)
		)
		ENGINE=INNODB`, function(err, result) {
				if(err){		console.log('erreur lors de crétaion table parties : ' + err); }
				else{		console.log('table parties OK');  }	
		});
		connexion.query(`CREATE TABLE IF NOT EXISTS correspondances(
		
			idPartie SMALLINT UNSIGNED NOT NULL,
			idMembre SMALLINT UNSIGNED NOT NULL,
			date_inscription DATETIME NOT NULL,
			gagnant VARCHAR(3),
			INDEX ind_idPartie(idPartie),
			INDEX ind_idMembre(idMembre)
		)
		ENGINE=INNODB`, function(err, result) {
			if(err){		console.log('erreur lors de crétaion table correspondances : ' + err);  reject(err);  }
			else{		console.log('table correspondances OK');  }	
			return resolve();
		});
	});
// suppression des parties en cours au démarrage : 
	var nettoyerParties = new Promise(function(resolve, reject){
		connexion.query(`DELETE FROM parties WHERE etat!='terminee'`, function(err, result) {
			if(err){		console.log('erreur lors de nettoyerParties : ' + err);  return reject(err);}
			else{		
				console.log('nettoyage tableS  nettoyerParties OK'); 
			}	
		});
	});
	var getAllIdsPartiesTerminees = new Promise(function(resolve, reject){
		connexion.query(`SELECT id FROM parties WHERE etat!='terminee'`, function(err, result) {
			if(err){		console.log('erreur lors de getAllIdPartiesTerminees : ' + err); return reject(err) }
			else{		
				var newList = [];
				result.forEach(function(parties){
					newList.push(parties['id']);
				})
				return resolve(newList);
			}	
		});
	});
	nettoyerCorrespondances = function(listIdsParties) {
		return new Promise(function(resolve, reject){
			listIdsParties.forEach(function(idPartie){
console.log('nettoyage correspondances  nettoyerPartie : ' + idPartie); 
				connexion.query(`DELETE FROM correspondances WHERE idPartie=` + idPartie, function(err, result) {
					if(err){		console.log('erreur lors de getAllIdPartiesTerminees : ' + err); }	
				});
			})  // fin forEach
			console.log('nettoyage correspondances  nettoyerParties OK'); 
			return resolve();
		});
	};
	checkTables.then(function(){	
console.log('checkTables');
		nettoyerParties.then(function(){
console.log('nettoyerParties');
			getAllIdsPartiesTerminees.then(listIdsParties => {
console.log('getAllIdsPartiesTerminees');
				nettoyerCorrespondances(listIdsParties).then(function(){
console.log('listIdsParties : ' + listIdsParties);
					console.log('checkDB OK'); connexion.end(function(){});
				}).catch(err => {		console.log('checkDB KO, catch nettoyerCorrespondances : ' + err);	});
			}).catch(err => {	console.log('checkDB KO, catch getAllIdsPartiesTerminees : ' + err);	}); 		
		}).catch(err => {	console.log('checkDB KO, catch nettoyerParties : ' + err);	}); 	
	}).catch(err => {	console.log('checkDB KO, catch checkTables : ' + err);	}); 
	
/*	,
		CONSTRAINT fk_idMembre FOREIGN KEY ( idMembre ) REFERENCES membres (id),
		CONSTRAINT fk_idPartie FOREIGN KEY ( idPartie ) REFERENCES membres (id)*/
}
/*
		dans checkBDD, reste à : 
			- supprimer toutes les parties non "terminee", et les entrées correspondances liées
			- mettre un index | clés étrangères OK sur correspondances
*/
// INSCRIPTION : 
exports.dispoPseudo = function(pseudo, callback){
	var connexion = require('./module_connexion.js').connexion();
	connexion.connect();
	var pseudoDispo = true;
	var test = connexion.query("SELECT * FROM membres", function(err, rows, fields) {
				if (err) throw err;
				
				rows.forEach(function(un){
					if(un.pseudo == pseudo)
					{
						pseudoDispo = false;
					}
				});
	}); 
	connexion.end(function(err){
			callback(pseudoDispo);
		});
}
exports.dispoMail = function(mail, callback)
{
	var connexion = require('./module_connexion.js').connexion();
	connexion.connect();
	var mailDispo = true;
	var test = connexion.query("SELECT * FROM membres", function(err, rows, fields) {
				if (err) throw err;
				
				rows.forEach(function(un){
					if(un.mail == mail)
					{
						mailDispo = false;
					}
				});
	}); 
	connexion.end(function(err){
			callback(mailDispo);
		});
}

// connexion : 

exports.idsVerif = function(credentials, callback)
{
	var sha256 = require('js-sha256');
	var thatsOK = false;
	var connexion = require('./module_connexion.js').connexion();
	connexion.connect();
	return new Promise(function(resolve, reject){
		connexion.query("SELECT * FROM membres", function(err, rows, fields) {
			if (err) {console.log("err Select idsVerif : " + err); return reject(err);		}
			rows.forEach(function(un){
				if(un.pseudo == credentials['pseudo'] && un.password == sha256(credentials['password']))
				{
					thatsOK = true;
				}
			});
			return resolve(thatsOK);
		});
	});
}
exports.isJoueurConnecte = function(pseudo)
{
	return new Promise(function(resolve, reject){
		var isJCo = false;
		session.joueursConnectes.forEach(function(joueur){
			if(joueur.pseudo == pseudo){	isJCo = true;}
		})
		return resolve(isJCo);
	});
}
// fonctions objets (joueurs, parties)
exports.getInfosJoueur = function getInfosJoueur(pseudo)
{
	return new Promise(function(resolve, reject){
		var connexion = require('./module_connexion.js').connexion();
		connexion.connect();

		connexion.query("SELECT * FROM membres WHERE pseudo='" + pseudo.trim() + "'", function(err, rows, fields) {
									if (err){ 
										console.log(" erreur getInfosJoueur " + err);
										return reject(err);
									}
									return resolve(rows[0]);
		});
	});
}
function getJoueurFromPseudo(pseudo)
{
	
	return new Promise(function(resolve, reject){
		var connexion = require('./module_connexion.js').connexion();
		connexion.connect();

		connexion.query("SELECT * FROM membres WHERE pseudo='" + pseudo.trim() + "'", function(err, rows, fields) {
			if (err){ 
				console.log(" erreur getInfosJoueur " + err);
				return reject(err);
			}
			var j = require('./js_objets/js_joueur');
			var joueur = new j.Joueur(pseudo.trim());
			joueur.hydrate(rows[0]['id'], rows[0]['password'], rows[0]['mail'],	rows[0]['points'], rows[0]['date_inscr'], rows[0]['date_last']);
			console.log("getJoueurFromPseudo" + joueur.mail);
			return resolve(joueur);
		});
	});
}
exports.getJoueurFromPseudo = getJoueurFromPseudo;
/*
exports.getJoueurFromPseudo = function(pseudo)
{
	
	return new Promise(function(resolve, reject){
		var connexion = require('./module_connexion.js').connexion();
		connexion.connect();

		connexion.query("SELECT * FROM membres WHERE pseudo='" + pseudo.trim() + "'", function(err, rows, fields) {
			if (err){ 
				console.log(" erreur getInfosJoueur " + err);
				return reject(err);
			}
			var j = require('./js_objets/js_joueur');
			var joueur = new j.Joueur(pseudo.trim());
			joueur.hydrate(rows[0]['id'], rows[0]['password'], rows[0]['mail'],	rows[0]['points'], rows[0]['date_inscr'], rows[0]['date_last']);
			console.log("getJoueurFromPseudo" + joueur.mail);
			return resolve(joueur);
		});
	});
}
*/
function inscrireJoueurAPartie(idJ, idPartie)
{
	return new Promise(function(resolve, reject){
		var connexion = require('./module_connexion.js').connexion();
		connexion.connect();
		var maintenant = new Date();
		donnees = {
			idMembre: idJ,
			idPartie: idPartie,
			date_inscription: maintenant.getFullYear() + "-" + (maintenant.getMonth() + 1) + "-" 
				+ maintenant.getDate() + " " + maintenant.getHours() + ":" 
				+ maintenant.getMinutes() + ":" + maintenant.getSeconds()
		};
		connexion.query("INSERT INTO correspondances SET ?", donnees, function(err, result) {
			if(err){		
				console.log('erreur lors de l\'insertion dans correspondances (fonction inscrireJoueurAPartie) :\n'
				+ err); return reject(err); 
			}
			session.parties.forEach(function(laPartie){		if(laPartie.id == idPartie){   laPartie.addJoueur(idJ);	}	})
			return resolve(1);	
		});					
	});
}
exports.inscrireJoueurAPartie = inscrireJoueurAPartie;
function desinscrireJoueurDunePartie(idJ, idPartie)
{
	return new Promise(function(resolve, reject){
		var connexion = require('./module_connexion.js').connexion();
		connexion.connect();
		connexion.query("DELETE FROM correspondances WHERE idPartie=" + idPartie + " AND idMembre=" + idJ,	
			function(err, result) {
			if(err){		
				console.log('erreur lors de DELETE dans correspondances (fonction desinscrireJoueurDunePartie) :\n'
				+ err); return reject(err); 
			}
			session.parties.forEach(function(laPartie){		if(laPartie.id == idPartie){   laPartie.supprJoueur(idJ);	}	})
			return resolve(1);	
		});					
	});
}
exports.desinscrireJoueurDunePartie = desinscrireJoueurDunePartie;
function getInfosPartieFromDate(dateFormatSQL)
{
	console.log("getInfosPartieFromDate + " + dateFormatSQL);
	return new Promise(function(resolve, reject){
		var connexion = require('./module_connexion.js').connexion();
		connexion.connect();
		connexion.query("SELECT id FROM parties WHERE date_creation='" + String(dateFormatSQL) + "'", 
										function(err, rows, fields) {
			if (err){ 
				console.log(" erreur getIdPartieFromDate " + err);
				return reject(err);
			}
			return resolve(rows[0]);
		});
	});
}
exports.creationPartie = function(idLanceur, jeu)
{
	return new Promise(function(resolve, reject){
		var connexion = require('./module_connexion.js').connexion();
		connexion.connect();

		var p = require('./js_objets/js_partie');
		var partie = new p.Partie(idLanceur, jeu);

		var donnees  = {
			etat: partie.etat,
			jeu: partie.jeu,
			idLanceur: partie.idLanceur, 
			date_creation: partie.date_creation.getFullYear() + "-" + (partie.date_creation.getMonth() + 1) + "-" 
				+ partie.date_creation.getDate() + " " + partie.date_creation.getHours() + ":" 
				+ partie.date_creation.getMinutes() + ":" + partie.date_creation.getSeconds()
		};
		connexion.query("INSERT INTO parties SET ?", donnees, function(err, result) {
			if(err){		console.log('erreur lors de l\'insertion : ' + err); return reject(err);  }
			getInfosPartieFromDate(donnees['date_creation']).then(infos => {
				partie.setId(infos['id']);
				session.parties[partie.id] = partie;

				inscrireJoueurAPartie(partie.idLanceur, partie.id)
					.then(function(){ 	return resolve(partie);		})
					.catch(err => {console.log("js bdd creation partie catch" + err); reject(err);  });
			}).catch(err => {	
				console.log('erreur getIdDernierePartie catch : ' + err); 
				reject(err);				
			});				
		});
	});
}
exports.getIdPartieActiveD1J = function(pseudo)
{
	return new Promise(function(resolve, reject){
		var connexion = require('./module_connexion.js').connexion();
		connexion.connect();
		getJoueurFromPseudo(pseudo)
			.then(j => {
				connexion.query("SELECT idPartie FROM correspondances WHERE idMembre=" + j.id + 
				" ORDER BY date_inscription DESC", function(err, rows){
						if (rows == 0){		return resolve(-1);	}
						else{	return resolve(rows[0]['idPartie']);	}						
					});
			}).catch(err => {
				console.log(" catch getIdPartieActiveD1J : " +  err);
			});
	});
}
/*  A SUPPR
function supprPartie(idPartie)
{
console.log(" funcrtion supprPartie, tentative suppr id p : " + idPartie);
	var monIndex = -1;
	var compteur = 0;
	session.parties.forEach(function(partie){
		if(partie.id == idPartie)
		{
			monIndex = compteur;
		}
		compteur ++;
	})
	if(monIndex != -1)
	{
		session.parties.slice(monIndex, 1); 
		console.log(' supprPartie n°' + idPartie + ', liste : ' + session.parties)
		return 1;
	}
	else{ console.log('impossible de supprimer la partie, index = -1'); return 0; }
}
*/
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
		if(monIndex != -1){ 	session.parties.splice(monIndex, 1);	return resolve(1);	}
		else { 	console.log("else splice"); 	return reject(-1);	}
	 });
}
function inscritsFromIdPartie(idPartie)
{
	return new Promise(function(resolve, reject){
		connexion.query("SELECT * FROM correspondances WHERE idPartie=" + idPartie, function(err, rows, fields) {
			if (err){ 
				console.log(" erreur inscritsFromIdPartie " + err);
				return reject(err);
			}
			var listIdInscrits = [];
			rows.forEach(function(entrees){
				listIdInscrits.push(entrees['idMembre']);
			})
			return resolve(listIdInscrits);  // retourne un tableau d'id
		});
	});
}
function infosPartieFromId(idPartie)
{
	return new Promise(function(resolve, reject){
		var connexion = require('./module_connexion.js').connexion();
		connexion.connect();
		connexion.query("SELECT * FROM parties WHERE id=" + idPartie, function(err, rows, fields) {
			if (err){ 
				console.log(" erreur infosPartieFromId " + err);
				return reject(err);
			}
			return resolve(rows[0]); // retourne LA ligne correspondante
		});
	});
}
function partieFromId(idPartie)
{
	return new Promise(function(resolve, reject){
		infosPartieFromId(idPartie)
			  .then(data => {
				  inscritsFromIdPartie(idPartie)
				  	.then(listDInscrits =>{
						var p = require('./js_objets/js_partie');
						var partie = new p.Partie(data['idLanceur'], data['jeu']);
						partie.hydrate(data['id'], data['date_creation'], data['date_fin'],
						data['idVainqueur'], listDInscrits);
						return resolve(partie);
					  }).catch(err => {	console.log("erreur catch inscritsFromIdPartie dans partieFromId  : " + err); return reject(err);	});
			}).catch(err => {	console.log("erreur catch infosPartieFromId dans partieFromId  : " + err); return reject(err);	});
	});
}
function partieFromList(idPartie)
{
	var monIndex = -1, compteur = 0;
	session.parties.forEach(function(partie){
		if(partie.id == idPartie){	monIndex = compteur;	}
		compteur ++;
	})
	if(monIndex != -1){	return session.parties[monIndex];	}
	else{	console.log('partieFromList : impossible de retrouver la partie n° ' + idPartie + " dans la liste.")	}	
}
exports.annulerUnePartie = function(idPartie)
{
	
console.log('annuler parti n° ' + idPartie);
	var connexion = require('./module_connexion.js').connexion();
	connexion.connect();

	var removeCorrespondances = new Promise(function(resolve, reject){
			connexion.query("DELETE FROM correspondances WHERE idPartie=" + idPartie, function(err, result) {
			if(err){		
				console.log('erreur lors de DELETE annulerUnePartie : ' + err);
				return reject(err); 
			}
			return resolve(1);
			});
	});
	return new Promise(function(resolve, reject){
		supprPartie(idPartie); // des var de sessions
	//	var partie = partieFromList(idPartie);
	//	partie.annuler();
		getIdInscritsAUnePartieFromIdPartie(idPartie)
			.then(idInscrits => {
				require('./js_socket_io/moduleIo_com_connecte.js')
				.envoyerMessTabIdsMembres(idInscrits, "vousAvezEteDesinscris", idPartie); // on avise les inscits
				connexion.query("UPDATE parties SET etat='annulee' WHERE id=" + idPartie, function(err, result) {
					if(err){		
						console.log('erreur lors de UPDATE annulerUnePartie : ' + err);
						return reject(err); 
					}
					removeCorrespondances
						.then(function(){
							return resolve(1);
						}).catch(err => { console.log('erreur lors de removeCorrespondances  : ' + err); });
				});
			}).catch(err => { console.log('erreur lors de removeCorrespondances  : ' + err); });
	});
}
function getIdInscritsAUnePartieFromIdPartie(idPartie)
{
	return new Promise(function(resolve, reject){
		var connexion = require('./module_connexion.js').connexion();
		connexion.connect();
		connexion.query("SELECT idMembre FROM correspondances WHERE idPartie=" + idPartie, function(err, result) {
			if(err){		
				console.log('erreur lors de SELECT getIdInscritsAUnePartieFromIdPartie : ' + err);
				return reject(err); 
			}
			var idInscrits = [];
			result.forEach(function(entree){
				idInscrits.push(entree['idMembre']);
console.log("getIdInscritsAUnePartieFromIdPartie, idMembre :  " + entree['idMembre']);
			})
			return resolve(idInscrits);
		});
	});
}
exports.getIdInscritsAUnePartieFromIdPartie = getIdInscritsAUnePartieFromIdPartie;
exports.getPseudosInscrits = function(partiesIdInscr)  // partiesIdInscr[i].length  => nb inscrits session.parties[i]
{
	return new Promise(function(resolve, reject){
		var connexion = require('./module_connexion.js').connexion();
		connexion.connect();
		connexion.query("SELECT pseudo FROM membres WHERE id=" + idPartie, function(err, result) {
			if(err){		
				console.log('erreur lors de SELECT getIdInscritsAUnePartieFromIdPartie : ' + err);
				return reject(err); 
			}
			result.forEach(function(entree){
				console.log("getIdInscritsAUnePartieFromIdPartie, idMembre :  " + entree['idMembre']);
			})
			return resolve();
		});
	});
}