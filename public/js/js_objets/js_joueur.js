var Promise = require('promise');

function Joueur(pseudo)
{
	this.pseudo = pseudo;
	this.partieLancee = false;
	this.isInscrit = false;

	this.hydrate = function(id, password, mail, points, date_inscr, date_last)
	{
		this.id = id;
		this.password = password;
		this.mail = mail;
		this.points = points;
		this.date_inscr = date_inscr;
		this.date_last = date_last;
	}
/*	this.setPartieLancee(trueOrFalse = false)
	{
		this.partieLancee = trueOrFalse;
	} */
}
exports.Joueur = Joueur;

exports.joueurFromPseudo = function(pseudo)
{
	return new Promise(function(resolve, reject){
		require('../js_bdd.js').getInfosJoueur(pseudo).then(j => { // tulisation d'une autre promise
			var joueur = new Joueur(pseudo); 
			joueur.hydrate(j["id"], j["password"], j["mail"],j["points"] ,j["date_inscr"] ,j["date_last"]);
			return resolve(joueur);
		}).catch(err =>{
			console.log("err jouerFromP : " + err);
			return reject(err);
			});
	});
}
exports.idFromPseudo = function(pseudo)
{
	return new Promise(function(resolve, reject){
		require('../js_bdd.js').getInfosJoueur(pseudo).then(j => {
			return resolve(j["id"]);
		}).catch(err =>{
			console.log("err idFromPseudo : " + err);
			return reject(err);
			});
	});
}