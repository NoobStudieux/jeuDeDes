function Partie(lanceur)
{
		this.lanceur = lanceur;
		this.lanceur = lanceur;
		this.lanceur = lanceur;
	
/*	this.nom = nom;
	this.nom = nom;
	this.nom = nom;
	this.nom = nom;*/
/*
	this.hydrate = function(id, password, mail, points, date_inscr, date_last)
	{
		this.id = id;
		this.password = password;
		this.mail = mail;
		this.points = points;
		this.date_inscr = date_inscr;
		this.date_last = date_last;
}
	*/

}/*
Joueur.prototype.fooBar = function() {

};
*/
/*
exports.joueurFromPseudo= function(pseudo)
{
	var connexion = require('../js_connexion/module_connexion.js').connexion();
console.log("joueurFromPseudo");
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
var joueur = new Joueur(pseudo); joueur.hydrate(j["id"], j["password"], j["mail"],j["points"] ,j["date_inscr"] ,j["date_last"]);
											return joueur;
}
/*
exports.isJoueurDansListe(pseudo, isConnectedCookie)
{
	var jConnecte = false;
	if(isConnectedCookie)// && res.cookie('isConnected')["isConnected"] == true)
	{
		jConnecte = true;
			// vérif liste de joueurs
		var joueurPresent = false;
		session.joueursConnectes.forEach(joueur){
			if(joueur.pseudo == isConnectedCookie['pseudo'])
			{
				joueurPresent = true;
			}
			else{

			}
		}
		if(joueurPresent)
		{
			console.log('joueur déjà présent dans la liste des joueurs');
		}
		else
		{
			console.log('joueur ajouté dans la liste des joueurs');
			session.joueursConnectes.push(require('./public/js/js_joueur/js_joueur.js')
			.joueurFromPseudo(isConnected['pseudo']));
		}
	}
	else{
		return false;
	}
	return jConnecte;
}*/