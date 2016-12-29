/*
		Avec /public/js/js_Manager.js, ce sont les 2 seuls fichiers pouvant toucher / accéder à la bdd
*/

// var connexion = require('./module_connexion.js').connexion();
/*
	voir pour avoir var connexion en variable pas à chaque mdule

*/
var Promise = require('promise');

exports.checkDB = function()
{
/*
		Vérification de l'existence des tables (et création sinon): 
			- membres
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

	query = connexion.query(`CREATE TABLE IF NOT EXISTS parties(
	
		id SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
		etat VARCHAR(14) NOT NULL,
		jeu VARCHAR(20) NOT NULL,
		nbJMax SMALLINT UNSIGNED NOT NULL,
		lanceur VARCHAR(14) NOT NULL,
		date_creation DATETIME NOT NULL,
		date_fin DATETIME NOT NULL,
		idVainqueur SMALLINT UNSIGNED NOT NULL,
		PRIMARY KEY ( id ),
		INDEX ind_idVainqueur(idVainqueur)
	)
	ENGINE=INNODB`, function(err, result) {
			if(err){		console.log('erreur lors de crétaion table parties : ' + err);  }
			else{		console.log('table parties OK');  }	
	});
	query = connexion.query(`CREATE TABLE IF NOT EXISTS correspondances(
	
		idMembre SMALLINT UNSIGNED NOT NULL,
		idPartie SMALLINT UNSIGNED NOT NULL,
		gagnant VARCHAR(3),
		CONSTRAINT fk_idMembre FOREIGN KEY ( idMembre ) REFERENCES membres (id),
		CONSTRAINT fk_idPartie FOREIGN KEY ( idPartie ) REFERENCES membres (id)
		)
		ENGINE=INNODB`, function(err, result) {
			if(err){		console.log('erreur lors de création table correspondances : ' + err);  }
			else{		console.log('table correspondances OK');  }	
	});
/*	require('./js_objets/js_Manager.js');
	var Manager = new require('./js_objets/js_Manager.js').Manager(connexion);
//	console.log('depuis bdd : ' + Manager.exemple);
//	var partie = Manager.creerPartie(23, "jeu des dix Mille");
/*	console.log('partie : ' + partie.idLanceur)
*/	connexion.end(function(){});
}
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
		//	return pseudoDispo;
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
	connexion.query("SELECT * FROM membres", function(err, rows, fields) {
				if (err) throw err;
				
				rows.forEach(function(un){
					if(un.pseudo == credentials['pseudo'] && un.password == sha256(credentials['password']))
					{
						thatsOK = true;
					}
				});
			});
		connexion.end(function(err){
			callback(thatsOK);
		});

}

// fonctions objets (joueurs, parties)
exports.getInfosJoueur = function getInfosJoueur(pseudo)
{
	return new Promise(function(resolve, reject){
		var connexion = require('./module_connexion.js').connexion();
		connexion.connect();

		connexion.query("SELECT * FROM membres WHERE pseudo='" + pseudo.trim() + "'", function(err, rows, fields) {
									//
									if (err){ 
										console.log(" erreur getInfosJoueur " + err);
										return reject(err);
									}

									return resolve(rows[0]);
							/*
											var joueur = new joueur(pseudo);
											joueur.hydrate(j["id"], j["password"], j["mail"],j["points"] ,j["date_inscr"] ,j["date_last"]);
											
											connexion.end(function(){});
console.log("joueurFromPseudo retour jouer");
											return joueur; */
						//				}
						});
	});
/* avant promise :
	var connexion = require('./module_connexion.js').connexion();
	connexion.connect();

//				try {
						var j = connexion.query("SELECT * FROM membres WHERE pseudo= '" + pseudo + "'", function(err, rows, fields) {
						console.log("joueurFromPseudo query");				});/*				
									if (err) throw err; // utile ?
									else{
											var joueur = new joueur(pseudo);
											joueur.hydrate(j["id"], j["password"], j["mail"],j["points"] ,j["date_inscr"] ,j["date_last"]);
											
											connexion.end(function(){});
console.log("joueurFromPseudo retour jouer");
											return joueur;
										}
						});
/*				}					
				catch(err) {
					console.log( err.message); connexion.end(function(){});
					return false;
				}
*/
// avant promise	return j;
}
exports.getInfosJoueur();
/*
		.then(infoJ => { 


		});*/