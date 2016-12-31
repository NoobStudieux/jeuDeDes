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
	
	var query = connexion.query(`CREATE TABLE IF NOT EXISTS membres(
	
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
			if(err){		console.log('erreur lors de crétaion table parties : ' + err);  }
			else{		console.log('table parties OK');  }	
	});
	query = connexion.query(`CREATE TABLE IF NOT EXISTS correspondances(
	
		idPartie SMALLINT UNSIGNED NOT NULL,
		idMembre SMALLINT UNSIGNED NOT NULL,
		gagnant VARCHAR(3),
		INDEX ind_idPartie(idPartie),
		INDEX ind_idMembre(idMembre)
	)
	ENGINE=INNODB`, function(err, result) {
		if(err){		console.log('erreur lors de crétaion table correspondances : ' + err);  }
		else{		console.log('table correspondances OK');  }	
	});
// suppression des parties en cours au démarrage : 
	connexion.query(`UPDATE parties SET etat='annulee' WHERE etat!='terminee' AND etat!='annulee'`, function(err, result) {
			if(err){		console.log('erreur lors de la suppression des parties non terminees : ' + err);  }
			else{		console.log('nettoyage table parties OK');  }	
	});
	connexion.end(function(){});
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
function getIdDernierePartie()
{
	return new Promise(function(resolve, reject){
		var connexion = require('./module_connexion.js').connexion();
		connexion.connect();
		connexion.query("SELECT id FROM parties ORDER BY id DESC", function(err, rows, fields) {
			if (err){ 
				console.log(" erreur getIdLastParties " + err);
				return reject(err);
			}
			return resolve(rows[0]['id']);
		});
	});
}
function inscrireJoueurAPartie(idJ, idPartie)
{
	return new Promise(function(resolve, reject){
		var connexion = require('./module_connexion.js').connexion();
		connexion.connect();
		donnees = {
			idMembre: idJ,
			idPartie: idPartie
		};
		connexion.query("INSERT INTO correspondances SET ?", donnees, function(err, result) {
			if(err){		
				console.log('erreur lors de l\'insertion dans correspondances (fonction inscrireJoueurAPartie) :\n'
				+ err); return reject(err); 
			}
			return resolve();	
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
			nbJMax: partie.nbJMax, 
			idLanceur: partie.idLanceur, 
			date_creation: partie.date_creation.getFullYear() + "-" + (partie.date_creation.getMonth() + 1) + "-" 
				+ partie.date_creation.getDate() + " " + partie.date_creation.getHours() + ":" 
				+ partie.date_creation.getMinutes() + ":" + partie.date_creation.getSeconds()
		};
		connexion.query("INSERT INTO parties SET ?", donnees, function(err, result) {
			if(err){		console.log('erreur lors de l\'insertion : ' + err); return reject(err);  }
			getIdDernierePartie().then(function(idDernierePartie){
				partie.setId(idDernierePartie);
				inscrireJoueurAPartie(partie.idLanceur, partie.id).then(function(){ 	return resolve(partie);		})
					.catch(err => {console.log("js bdd creation partie catch" + err); reject(err);  });
			}).catch(err => {	
				console.log('erreur getIdDernierePartie catch : ' + err); 
				reject(err);				
			});				
		});
	});
}
function supprPartie(idPartie)
{
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
	return new Promise(function(resolve, reject){
		var connexion = require('./module_connexion.js').connexion();
		connexion.connect();
		supprPartie(idPartie);
	//	var partie = partieFromList(idPartie);
	//	partie.annuler();
		connexion.query("UPDATE parties SET etat='annulee' WHERE id=" + idPartie, function(err, result) {
			if(err){		
				console.log('erreur lors de UPDATE annulerUnePartie : ' + err);
				return reject(err); 
			}
			return resolve();
		});
	});
}
exports.getIdInscritsAUnePartieFromIdPartie = function(idPartie)
{
	return new Promise(function(resolve, reject){
		var connexion = require('./module_connexion.js').connexion();
		connexion.connect();
		connexion.query("SELECT idMembre FROM correspondances WHERE idPartie=" + idPartie, function(err, result) {
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