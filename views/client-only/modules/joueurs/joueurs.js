function joueur(nom = "nouveau joueur")
{
	this.nom = nom;
	this.points = 0;
	
	this.setPoints = function(nvxPoints)
	{
		if(this.points == 0)
		{
			if(nvxPoints >= 750)
			{
				this.points += nvxPoints;
				console.log('points set :' + nvxPoints);
				return true;
			}
			else
			{
				console.log('points set : 0');
				return false;
			}
		}
		else if(this.points > 10000)
		{
			console.log('points set : -' + nvxPoints);
			this.points -= nvxPoints;
			return true;
		}
		else if(this.points == 10000)
		{
			console.log('[méthode joueur] : le joueur a 10000 points.');
			return false;
		}
		else
		{
			this.points += nvxPoints;
			console.log('points set :' + nvxPoints);
			return true;
		}
		console.log('this.points :  ' + this.points);
	}
}
