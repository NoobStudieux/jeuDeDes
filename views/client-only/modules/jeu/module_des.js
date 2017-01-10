function randomize()
{
	var tabTirages = new Array();
	
	for(var i=0; i<6; i++)
	{
		var nveauLance = Math.floor(Math.random() * 6 + 1);
		tabTirages.push(nveauLance);
	}
	var nveauLance = Math.floor(Math.random() * 6);	
	return tabTirages[nveauLance];
}
function reInitVars()
{
	window.varDesSelected = [false, false, false, false, false]; 
	window.desSelected = [0, 0, 0, 0, 0];
	document.getElementById('boutonLancer').disabled = true;
	$('#boutonLancer').text('pas de dé à lancer');
	$('#boutonLancer').removeClass('lancerOK').addClass('lancerNOK');
	majEvenementClick();
}
function init5Des()
{
	for(var i=0; i<5; i++)
	{
		var nveauLance = randomize();
		var deBlanc = 0, deBleu = 0, deGris = 0, deRouge = 0, deVert = 0;
		var image = new Image(); image.width = String(50); image.height = String(50);
		
		switch(i)
		{
			case 0:
				deBlanc = nveauLance;
				var cheminImg = "web/deBlan" + String(nveauLance) + ".png";
				image.src = cheminImg;
				$('#caseDeBlanc').append(image); $(image).attr('id', 'deBlan').addClass('dés');
				window.cinqDes.push(image);
				break;
			case 1:
				deBleu = nveauLance;
				var cheminImg = "web/deBleu" + String(nveauLance) + ".png";
				image.src = cheminImg;
				$('#caseDeBleu').append(image); $(image).attr('id', 'deBleu').addClass('dés');
				window.cinqDes.push(image);
				break;
			case 2:
				deGris = nveauLance;
				var cheminImg = "web/deGris" + String(nveauLance) + ".png";
				image.src = cheminImg;
				$('#caseDeGris').append(image); $(image).attr('id', 'deGris').addClass('dés');
				window.cinqDes.push(image);
				break;
			case 3:
				deRouge = nveauLance;
				var cheminImg = "web/deRoug" + String(nveauLance) + ".png";
				image.src = cheminImg;
				$('#caseDeRouge').append(image); $(image).attr('id', 'deRoug').addClass('dés');
				window.cinqDes.push(image);
				break;
			case 4:
				deVert = nveauLance;
				var cheminImg = "web/deVert" + String(nveauLance) + ".png";
				image.src = cheminImg;
				$(image).attr('id', 'deVert').addClass('dés');
				$('#caseDeVert').append(image); 
				window.cinqDes.push(image);
				break;
		}    // fin switch
	}
}
function lancerDes5Des()
{
	for(var i=0; i<5; i++)
	{
		var nveauLance = randomize();
				
		switch(i)
		{
			case 0:
				var cheminImg = "web/deBlan" + String(nveauLance) + ".png";
				document.getElementById('deBlan').src = cheminImg; // window.cinqDes[1] ne fonctionnait pas ...
				break;
			case 1:
				var cheminImg = "web/deBleu" + String(nveauLance) + ".png";
				document.getElementById('deBleu').src = cheminImg;
				break;
			case 2:
				var cheminImg = "web/deGris" + String(nveauLance) + ".png";
				document.getElementById('deGris').src = cheminImg;
				break;
			case 3:
				var cheminImg = "web/deRoug" + String(nveauLance) + ".png";
				document.getElementById('deRoug').src = cheminImg;
				break;
			case 4:
				var cheminImg = "web/deVert" + String(nveauLance) + ".png";
				document.getElementById('deVert').src = cheminImg;
				break;
		}    // fin switch
		
		var randomTime = Math.floor(Math.random() * 3000 + 400);
		$(window.cinqDes[i]).hide().fadeIn(randomTime);
	}
}	//fin function lancer 5 des
function GestionLock1De(de)
{
	$(de).removeClass('dés').addClass('désMisDeCoté');
	$(de).off('click');
	var elementLogoCase = 'logo' + $(de).attr('id').substring(2,6);
	document.getElementById(elementLogoCase).childNodes[0].src = "web/lock.png";
}
function traitementBtnLancerDes()
{
		lancerDesSelected(window.desSelected);
		window.nbLances ++;
		if(window.nbLances == 3)
		{
			document.getElementById('boutonLancer').disabled == true;
			for(var k=0; k < window.cinqDes.length; k++)
			{
				$(window.cinqDes[k]).removeClass('dés').addClass('désMisDeCoté');
				$(window.cinqDes[k]).off('click', traitementClickImage);
				GestionLock1De(window.cinqDes[k]);
				window.nbLances = 0;
			}
		}
		window.points = calculPoints(window.cinqDes);
		document.getElementById('terminerCoup').disabled = false;
		$('#terminerCoup').addClass('lancerOK');
}
function traitementBtnTerminerCoup()
{
	document.getElementById('terminerCoup').disabled = false;
		var marque = window.joueurs[window.indexJoueurCourant].setPoints(window.points[0]);
		if(marque)
		{
			majInfoPoints(window.joueurs[window.indexJoueurCourant].nom, window.points[0], true);
		}
		else
		{
			majInfoPoints(window.joueurs[window.indexJoueurCourant].nom, 0, false); //(window.joueurs[window.indexJoueurCourant].nom, window.indexJoueurCourant].points);
		}
		for(var k=0; k < window.cinqDes.length; k++)
		{
			if(window.cinqDes[k].className == 'désMisDeCoté')
			{
				$(window.cinqDes[k]).removeClass('désMisDeCoté').addClass('dés');
			}
			$(window.cinqDes[k]).off('click', traitementClickImage);
			$(window.cinqDes[k]).css('border','').css('box-shadow', '2px 2px 2px rgba( 56, 27, 233 ,0.7)').on('click', traitementClickImage);		
		}
		if(window.indexJoueurCourant == window.joueurs.length - 1)
		{
			window.indexJoueurCourant = 0;
		}
		else
		{
			window.indexJoueurCourant ++;
		}
		window.nbLances = 0;
		majInfosJoueurs(window.joueurs, window.indexJoueurCourant);
		lancerDes5Des();
		reInitVars();
		initLockLogos();
		window.points = calculPoints(window.cinqDes);
		if(window.joueurs[window.indexJoueurCourant].points ==10000)
		{
			var tousJa10000 = true;
			for(var i=0; i < window.joueurs.length; i++)
			{
				if(window.joueurs[i].points != 10000)
				{
					tousJa10000 = false;
				}
			}
			if(!tousJa10000)
			{
				document.getElementById('boutonLancer').disabled = true;
				$('#boutonLancer').text('pas de dé à lancer');
				$('#boutonLancer').removeClass('lancerOK').addClass('lancerNOK');
				document.getElementById('terminerCoup').disabled = true;
				$('#infosCoup').hide(); $('#infosConsignes').hide();
				$('#deja10000').text(window.joueurs[window.indexJoueurCourant].points + 
				' a déjà fini avec 10000 points').fadeIn(700, function(){
							$('#deja10000').fadeOut(3000, function(){
									$('#infosConsignes').show();
									$('#terminerCoup').trigger('click');
										
								});
					});
			}
			else // tous les joueurs ont 10000
			{
				$('#infosConsignes').show().text("Tous les joueurs ont 10000 points,\nla partie est terminéé");
				document.getElementById('boutonLancer').disabled = true;
				$('#boutonLancer').text('partie terminée');
				document.getElementById('terminerCoup').disabled = true;
				$('#terminerCoup').text('partie terminée');
				$('#terminerCoup, #boutonLancer').css('color', 'white').css('backgroundColor',' black');
			}
		}
}
function lancerDesSelected(selection) // selection est une liste de Dés contenant des 0
{
// LOCK des dés hors sélection : 
	for(var k=0; k < window.cinqDes.length; k++)
	{
		var isSelected = false;
		for(var testSelec = 0; testSelec < selection.length ; testSelec ++)
		{
			if($(selection[testSelec]).attr('id') == $(window.cinqDes[k]).attr('id'))
			{
				isSelected = true;
			}
		}
		if(!isSelected)
		{
			GestionLock1De(window.cinqDes[k]);
		}
	}
// traitement lancé sélection :
	
	for(var indexDe = 0; indexDe < selection.length ; indexDe ++)
	{
		if(selection[indexDe] != 0)
		{
			var idAncien = $(selection[indexDe]).attr('id');
			var nveauLance = randomize();
			var randomTime = Math.floor(Math.random() * 3000 + 400);
			selection[indexDe].src = "web/" + idAncien + String(nveauLance) + ".png";
			
			$(selection[indexDe]).hide().fadeIn(randomTime);
		} // fin if
	}  // fin for	
	reInitVars();
}   // fin function lancer1De()
function indexFromId(idDe)
{
	var indexRetour=-1;
	switch(idDe)
	{
		case "deBlan":
			indexRetour = 0;
			break;
		case "deGris":
			indexRetour=1;
			break;
		case "deBleu":
			indexRetour=2;
			break;
		case "deRoug":
			indexRetour=3;
			break;
		case "deVert":
			indexRetour=4;
			break;
	}
	return parseInt(indexRetour);
}
function nbDesSelected()
{
	nbDesSelectionnes = 0;
	for(de in window.varDesSelected)
	{
		if(window.varDesSelected[de] == true){		nbDesSelectionnes ++;		}
	}
	return nbDesSelectionnes;
}
function calculPoints(array5Des)
{
	var points = 0;
	var cinqVals = [];
	var logsCoup = "";
	var valMutliple = 0;
// récupération des 5 valeurs actuelles : 
	for(var i=0; i < array5Des.length; i++)
	{
		var troncon = array5Des[i].src.split('web/de');
		cinqVals.push(parseInt(troncon[1].substr(4,1)));
	}
// parcours des 6 valeurs : 
	for(var val = 1; val < 7; val ++)
	{
	//comptes de valeurs communes (occurences) : 
		var occurences = 0;
		for(var i = 0; i < cinqVals.length; i++)
		{
			if(cinqVals[i] == val){		occurences ++;		}
		}

		if(occurences >= 4) // on a un quadruple
		{
			if(val == 1){	points = 10000 * val;		}
			else{		points = 1000 * val;		}
			valMutliple = val;
			logsCoup = "votre quadruple de " + String(val) + " vous rapporte " + String(points) + ".";
		}
		else if(occurences == 3) // on a un triple
		{
			if(val == 1){	points = 1000 * val;		}
			else{		points = 100 * val;		}
			valMutliple = val;
			logsCoup = "votre triple de " + String(val) + " vous rapporte " + String(points) + ".";
		}
		else{	logsCoup = "ni triple ni quadruple.";		}
	

// recherche de 1 et de 5 pour points "à côté"
	}
	for(var i = 0; i < cinqVals.length; i++)
	{
		if((cinqVals[i] == 1 || cinqVals[i] == 5) && valMutliple != cinqVals[i])
		{
			if(cinqVals[i] == 5)
			{
				points += 50;
				logsCoup = logsCoup + "\nun 5 vous rapporte 50 points.";
			}
			else if(cinqVals[i] == 1)
			{
				points += 100;
				logsCoup = logsCoup + "\nun 1 vous rapporte 100 points.";
			}
		} 
	}
	logsCoup = logsCoup + "\nTOTAL : " + points + ".";
	var retour = [points, logsCoup];
	majInfosCoup(retour[1], window.joueurs[window.indexJoueurCourant].points);
	
	return retour;
}