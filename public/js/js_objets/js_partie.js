function Partie(idLanceur, jeu)
{
	this.id=-1;
	this.idLanceur = idLanceur;
	this.jeu = jeu;
	this.etat = "lancee";		// 'lancee' , 'en cours', 'annulee' ou 'terminee'
	this.date_creation = new Date();
	this.inscrits = [idLanceur];
	this.nbJMax = 0;
	this.nbJMin = 0;

	if(jeu == "jeu des dix Milles")
	{
		this.nbJMax = 5;
		this.nbJMin = 2;
	}/*else if(){

	}*/
	else
	{
		this.nbJMax = 0; this.nbJMin = 0;
	}
	this.addJoueur = function(idNveauJoueur){	
		var doublon = false;
		this.inscrits.forEach(function(inscrit){
			if(inscrit == idNveauJoueur){	doublon = true;	}
		})
		if(doublon){	console.log("partie : "+ this.id +" : NVL INSCRIT NE PEUT ÊTRE AJOUTER CAR DÉJÀ INSCRIT"); return false;}
		else{this.inscrits.push(idNveauJoueur); return true; }
	}
	this.allInscrits = function(listIdInscrits)
	{
		this.inscrits = [];  	// r-a-z
		listIdInscrits.forEach(function(inscrit){
			this.inscrits.push(inscrit);
		})
	}
	this.supprJoueur = function(idJoueurASuppr)
	{
		var monIndex = -1;
		compteur = 0; var listTempo = [];
		this.inscrits.forEach(function(idJ){
			if(idJoueurASuppr != idJ){listTempo.push(idJ);}
			else{monIndex=compteur;}
			compteur ++;
		})
		this.inscrits = listTempo;
	//	this.inscrits.slice(monIndex, 1);
console.log("joueur " + idJoueurASuppr + " supprimé de la partie : " + this.id + ", reste(nt) : " + this.inscrits.length + " joueurs : ");
this.inscrits.forEach(function(i){
	console.log(i);
})
console.log("listTempo l : " + listTempo.length);
		/*this.inscrits.forEach(function(idJ){
			if(idJoueurASuppr == idJ)
			{
				monIndex = compteur;
			}
			compteur ++;
		})
		if(monIndex != -1)
		{
		//	this.inscrits.slice(monIndex,1); 
			delete this.inscrits[monIndex];
console.log("monIndex = " + monIndex + "joueur " + idJoueurASuppr + " supprimé de la partie : " + this.id + ", reste(nt) : " + this.inscrits.length + " joueurs : ");
this.inscrits.forEach(function(i){
	console.log(i);
})
			return 1;
		}else{ console.log("erreur suppression j, partie.supprJoueur : monIndex=-1"); return 0;}*/
	}
	this.hydrate = function(id, date_creation, date_fin, idVainqueur, listIdInscrits)
	{
		this.setId(id); this.setDateCreation(date_creation); this.setDateFin(date_fin);
		this.setIdVainqueur(idVainqueur); this.allInscrits(listIdInscrits);
	}
	this.setId = function(id){	this.id = id; }
	this.setDateFin = function(dateDeFin){	this.date_last = dateDeFin;		}
	this.setDateCreation = function(dateDeCreation){		this.date_creation = dateDeCreation;	}
	this.setId = function(id){		this.id = id;	}
	this.setIEtat = function(id){		this.etat = etat;	}
	this.setIdVainqueur = function(idVainqueur){	this.idVainqueur = idVainqueur;		}
	this.annuler = function(){		this.etat = 'annulee'; this.date_last = date();		}
	this.addPoints = function(points){		this.points += points;		}
}
exports.Partie = Partie;