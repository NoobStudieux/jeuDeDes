function Joueur(pseudo)
{
		this.pseudo = pseudo;
	
/*	this.nom = nom;
	this.nom = nom;
	this.nom = nom;
	this.nom = nom;*/

	this.hydrate = function(id, password, mail, points, date_inscr, date_last)
	{
		this.id = id;
		this.password = password;
		this.mail = mail;
		this.points = points;
		this.date_inscr = date_inscr;
		this.date_last = date_last;
	}
}

exports.joueurFromPseudo = function(pseudo)
{
	var Promise = require('promise');
	return new Promise(function(resolve, reject){
		require('../js_bdd.js').getInfosJoueur(pseudo).then(j => { // tulisation d'une autre promise
			var joueur = new Joueur(pseudo); 
			joueur.hydrate(j["id"], j["password"], j["mail"],j["points"] ,j["date_inscr"] ,j["date_last"]);
			console.log("retour joueur : " + joueur.pseudo + joueur.mail);
			return resolve(joueur);
		}).catch(err =>{
			console.log("err jouerFromP : " + err);
			return reject(err);
			});

	});

/*   avant test po=romise
	var j = require('../js_bdd.js').getInfosJoueur(pseudo);
	var joueur = new Joueur(pseudo); 
	joueur.hydrate(j["id"], j["password"], j["mail"],j["points"] ,j["date_inscr"] ,j["date_last"]);

	return joueur;
*/
}
/*
exports.isJoueurDansListe(pseudo)
{
	var jConnecte = false;
	if(isConnectedCookie)// && res.cookie('isConnected')["isConnected"] == true)
	{
		jConnecte = true;
			// vérif liste de joueurs
		var joueurPresent = false;
		session.joueursConnectes.forEach(function(joueur){
			if(joueur.pseudo == isConnectedCookie['pseudo'])
			{
				joueurPresent = true;
			}
			else{

			}
		})
		if(joueurPresent)
		{
			console.log('joueur déjà présent dans la liste des joueurs');
		}
		else
		{
			console.log('joueur ajouté dans la liste des joueurs');
			session.joueursConnectes.push(require('./public/js/js_joueur/js_joueur.js')
		//	.joueurFromPseudo(isConnected['pseudo']));
		}
	}
	else{
		return false;
	}
	return jConnecte;
}
*/