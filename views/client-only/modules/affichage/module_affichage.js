function initElements()
{
	$('#conteneur').hide(); $('#nomsJ').hide(); $('#infosPoints').hide();
	$('#deja10000').hide();
	document.getElementById('boutonLancer').disabled = true;
	$('#boutonLancer').text('pas de dé à lancer');
	$('#boutonLancer').addClass('lancerNOK');
	document.getElementById('terminerCoup').disabled = false;
	$('#terminerCoup').addClass('lancerOK');
	initLockLogos();
	$('div').css('box-shadow', '2px 2px 2px rgba( 56, 27, 233 ,0.7)');
}

function initNbJ() //option / select
{
	for(var i=1; i <7; i++)
	{
		$('#nbJ').append(new Option(String(i) + " joueurs", i));
	}	
}
function genererChampsNoms(nbJoueurs, listeVide)
{
	$('<br /><br />').appendTo('#nomsJ');
	for(var i=0; i < nbJoueurs; i ++)
	{
		var champ = $('<input>');
		$(champ).attr('type', 'text');
		$(champ).addClass('champsNom');
		$(champ).appendTo('#nomsJ');
		$(champ).val('joueur ' + String(i + 1));
		$('<br /><br />').appendTo('#nomsJ');
	}
	var bouton = $('<input/>').attr({
		type : 'button',
		id : 'validNoms',
		value : 'valider les noms'});
	$(bouton).addClass('noms');
	$(bouton).appendTo('#nomsJ');
	$('#intro').slideUp(2000, function(){
			$('#nomsJ').fadeIn(2000);
	});
		
	$('#validNoms').click(function(){
		$("#nomsJ").css('visibility', 'hidden');
		$("#conteneur").css('visibility', 'visible');
		var noms = $('.champsNom');
		for(var i=0; i < noms.length; i++)
		{
			var nomJ = String(noms[i].value);
			listeVide.push(new joueur(nomJ)); // la liste vide ne l'est plus
		}
		window.indexJoueurCourant = Math.floor(Math.random() * (listeVide.length - 1));
		$('#nomJCourant').text(listeVide[window.indexJoueurCourant].nom);
		$('#nomsJ').slideUp(2000, function(){
			$('#conteneur').fadeIn(2000);
		});
		creationAffichageJoueurs();
		
	});	
}
function creationAffichageJoueurs()
{
	for(joueur in window.joueurs)
	{
		var baliseJ = $('<a>').text(window.joueurs[joueur].nom + " : ").addClass('aJoueur');
		baliseJ.width = "60px";
		if(window.joueurs[window.indexJoueurCourant].nom == window.joueurs[joueur].nom)
		{
			// si c'est le joueur courant
			baliseJ.addClass('aJoueurCourant');
		}
		else
		{
			baliseJ.addClass('aJoueur');
		}
		var balisePoints = $('<span>').text(window.joueurs[joueur].points).addClass('aJrPoints');
		baliseJ.width = "60px";
		$(baliseJ).append(balisePoints); $(baliseJ).append("  points");
		$('#affichJoueurs').append(baliseJ); $('#affichJoueurs').append("<br /><br />");
	}
}
function majInfosCoup(nveauText, pointsJoueur) //appelée depuis calculPoints
{
	var a = $('<a>').text(nveauText);
	$('#infosCoup').children('a').remove();
	$('#infosCoup').append(a);
	$('#infosCoup').hide().fadeIn(1500);
	
	var nbLances = window.nbLances;
	if(pointsJoueur ==0)
	{
		var b = $('<a>').text("Lancé " + (nbLances + 1) + " : \nVous devez faire 750 points pour commencer.");
	}
	else if(pointsJoueur < 10000 || pointsJoueur > 10000)
	{
		var b = $('<a>').text("Lancé " + (nbLances + 1) + " : \nVous devez faire "+ String(10000 - pointsJoueur) + " points pour finir.");
	}
	else if(pointsJoueur == 10000)
	{
		var b = $('<a>').text("Lancé " + (nbLances + 1) + " : \nVous avez déjà 10000 points tout juste.");
	}
	$(b).attr('id', 'aInfoCons');
	$('#infosConsignes').children('a').remove();
	$('#infosConsignes').append(b);
	$('#aInfoCons').hide().fadeIn(1200);
}
function majInfosJoueurs(listeJoueurs, indexCourant)
{
	$('#nomJCourant').text(listeJoueurs[indexCourant].nom + "  (" + listeJoueurs[indexCourant].points + " points)");

	var affichJ = $('#affichJoueurs').children('a');
	for(var i = 0; i < window.joueurs.length; i++)
	{
		$(affichJ[i]).children('span').text(listeJoueurs[i].points);
		if(i == indexCourant)
		{
			if(affichJ[i].className != "undefined")
			{
				$(affichJ[i]).removeClass(affichJ[i].className);
			}
			$(affichJ[i]).addClass('aJoueurCourant');
			if(i != 0)
			{
				if(affichJ[i-1].className != "undefined")
				{
					$(affichJ[i-1]).removeClass(affichJ[i-1].className);
				}			
			}
			else
			{
				if(affichJ[listeJoueurs.length-1].className != "undefined")
				{
					$(affichJ[listeJoueurs.length-1]).removeClass(affichJ[listeJoueurs.length-1].className);
				}	
			}
		}
		if(listeJoueurs[i].points == 10000)
		{
			$(affichJ[i]).css('backgroundColor', "rgb(242,245,29)")
										   .css("fontWeight","600").css("borderRadius","10px")
										   .css('text-shadow','1px 1px 3px black').css('border','solid black 1px')
										   .css('color', 'rgb(43, 60, 228');
		}
	}
}
function majInfoPoints(nom, points, trueOrFalse = false)
{
	if(trueOrFalse)
	{
		$('#infosPoints').hide().text(nom + " marque " + points + "points.")
						 .fadeIn(3000, function(){
							$(this).fadeOut(5000);
						});
	}
	else
	{
		$('#infosPoints').hide().text(nom + " ne marque pas de points ce coup-ci.")
						 .fadeIn(3000, function(){
							$(this).fadeOut(5000);
						});
	}
}
function majEvenementClick()
{
	$('.dés').css('border', '');
	$('.dés').css('box-shadow', '2px 2px 2px rgba( 56, 27, 233 ,0.7)');		
}
function initLockLogos()
{
	var logosLock = $('.logo');
	
	for(var i=0; i<logosLock.length; i++)
	{
		if(logosLock[i].childNodes.length > 0)
		{
			$(logosLock[i].childNodes[0]).remove();
		}
		$(logosLock[i]).css('backgroundColor','rgb(245,120,59)');
		var image = new Image();
		image.src = "web/lockNOT.png";
		image.width = 22; image.height = 22;
		$(logosLock[i]).append(image);
	}
}

function traitementClickImage()
{
	indexDeSelected = parseInt(indexFromId(($(this).attr('id'))));
			var idDe = $(this).attr('id');
			if(window.varDesSelected[indexDeSelected] == true)
			{
				$(this).css('border', '').css('box-shadow', '2px 2px 2px rgba( 56, 27, 233 ,0.7)');
				window.varDesSelected[indexDeSelected] = false;
				window.desSelected[indexDeSelected] = 0;
			}
			else if(nbDesSelected() < 6) // && à false dans l'array (else)
			{
				if(window.varDesSelected[indexDeSelected] == false)
				{
					$(this).css('border', 'solid 3px orange').css('box-shadow', '8px 8px 8px rgba( 253, 170, 10 ,0.7)');	
					window.varDesSelected[indexDeSelected] = true;
			//
					var decoupe = this.src.split('web/de');
					var valeur = parseInt(decoupe[1].substr(4,1));
					
					window.desSelected[indexDeSelected] = this;
				}
			}
		// gestion bouton lancer
			if(nbDesSelected() > 0 && nbDesSelected() < 6)
			{
				if(nbDesSelected() == 1)
				{
					$('#boutonLancer').text('lancer le dé.');
				}
				else
				{
					$('#boutonLancer').text('lancer les ' + nbDesSelected() + ' dés.');
				}			
			}
			else if(nbDesSelected() == 0)
			{
				document.getElementById('boutonLancer').disabled = true;
				$('#boutonLancer').text('pas de dé à lancer');
				$('#boutonLancer').removeClass('lancerOK').addClass('lancerNOK');
				document.getElementById('terminerCoup').disabled = false;
				$('#terminerCoup').addClass('lancerOK');
		//		$('#terminerCoup').css('textShadow','1px 1px 3px red').css('color', 'rgb(132,73,85)');
				if(window.nbLances == 2)
				{
					console.log('zero selected et 3eme lancé');
				}
				else
				{
					console.log('zero selected et 1er ou 2eme lancé');
				}
				
			}
			if(nbDesSelected() > 0)
			{
				document.getElementById('boutonLancer').disabled = false;
				$('#boutonLancer').removeClass('lancerNOK').addClass('lancerOK');
				document.getElementById('terminerCoup').disabled = true;
				$('#terminerCoup').removeClass('lancerOK');
		//		$('#terminerCoup').css('textShadow','1px 1px 3px black').css('color', 'rgb(132,73,85)');
			}
}
