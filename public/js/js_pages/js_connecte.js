window.joueur; // concerne le joueur client de cette page
window.joueurs = ['vide']; // les autres joueurs connectés
window.amIInscris = false;  // passera à false à l'inscription puis à true à désinscription, fin partie ou annulation partie
window.autrePartie = null; // ici sera stockée la div englobante (ex pour retrouver l'affichage sur une demande d'inscription)
window.parties = [];
// com .io 
var socket = io.connect('http://localhost:8080');

function majListeJoueurs(listeJoueurs)
{
console.log("client : " + window.joueur.pseudo + " maj liste joueurs" + listeJoueurs.length);
    $('#listeJoueurs li').remove();
    var list=[];
    listeJoueurs.forEach(function(joueur){
        $('#listeJoueurs').append($('<li>').text(joueur.pseudo));
    })
    window.joueurs = listeJoueurs;
}
function refreshSInscrire()
{
    $('.sInscrire').click(function(){
        var divEnglobante = $(this).parent().parent();
        var informationsUnePartie = $(divEnglobante).children('.infosUnePartie');
        var interactionsUnePartie = $(divEnglobante).children('.interacUnePartie');
        var buttInscr = $(interactionsUnePartie).children('.sInscrire');
        var idPartie = parseInt($(informationsUnePartie).children('.idAutrePartie').text().trim());
        var aEtatInscr = $(interactionsUnePartie).children('.etatInscr').removeClass("etatInscr").addClass("etatInscrAttente").hide(); 
        if(window.amIInscris == true) // je suis déjà inscris, je me désinscris
        {
            $(aEtatInscr).hide().text("désinscription demandée").fadeIn(500, function(){this.fadeOut(1000);});
            $(buttInscr).text("S'inscrire");  // possibilité d'ajouter une vérification avec .val(inscription); (qui ne modifie pas le texte mais simplement la avaleur du bouton)
            amIInscrisFalse();
            var dataDesinscr = {
                idJ: window.joueur.id,
                idP: idPartie
            };
            socket.emit('desinscription', dataDesinscr);
        }else{      // sinon je m'inscris
            $(aEtatInscr).hide().text("inscription demandée").fadeIn(500, function(){$(this).fadeOut(1000);});
            $(buttInscr).text("Se désinscrire");
            amIInscrisTrue();
            var dataInscr = {
                idJ: window.joueur.id,
                idP: idPartie
            };
            socket.emit('inscription', dataInscr);
        }
        window.autrePartie = $(divEnglobante);
    });
}
/*
    function supprPartie(idP)
*/
/*function supprPartie(idP)
{
    var monIndex = -1, compteur = 0 ;
    window.parties.forEach(function(p){
        if(p.id == idP)
        {
            monIndex = compteur;
        }
        compteur ++;
    })
    if(monIndex != -1){   window.parties.slice(monIndex, 1);     }
    else{     
alert("supprPartie + tentative de supprimer une partie inexistante : " + idP);      }
}*/
function maCouleur()
{
    var rgbArray = [];			
    for(i=0; i<3; i++)
    {
        rgbArray.push(Math.floor((Math.random() * 255) + 1));
    }
    var couleur1 = rgbArray[0]; var couleur2 = rgbArray[1]; var couleur3 = rgbArray[2]; 
    maCouleurString = "rgba(" + couleur1.toString() + "," + couleur2.toString() + "," 
    + couleur3.toString() + ", 0.55)";
    return maCouleurString;
}
function amIInscrisTrue()
{
    $('nvllePartie').prop('disabled',true);
    $('lancerPartie').prop('disabled',true);
    $('.sInscrire').prop('disabled',true);
    $('.nvllePartie').prop('disabled',true);
    window.amIInscris = true;
}
function amIInscrisFalse()
{
    $('nvllePartie').prop('disabled',false);
    $('lancerPartie').prop('disabled',false);
    $('.sInscrire').prop('disabled',false);
    window.amIInscris = false;
}
function getPseudoJoueurFromId(id)
{
    var bonPseudo = "introuvé";
    window.joueurs.forEach(function(j){
console.log('getPseudoJoueurFromId, id : ' + id + ', j.id : ' + j.id);
        if(id == j.id){     console.log('pseudo trouvé : ' + j.pseudo); bonPseudo = j.pseudo;    }
    })
    return bonPseudo;
}
function MAJInscritsAutrePartie(idJ, partie)
{
    var divEnglobanteParente;
    var parentTrouve = false;
    $('.idAutrePartie').each(function(elemId){
        if(partie.id == parseInt($(this).text().trim()))
        {
            divEnglobanteParente = $(this).parent().parent();
$(divEnglobanteParente).css('border', '3px solid white');
            parentTrouve = true;
        }
    })
    if(parentTrouve)
    {
        var inscritsAutrePartie = $(divEnglobanteParente).children('.inscritsAutrePartie');
        var maListe = $(inscritsAutrePartie).children('ul');
        $(maListe).children('li').remove();
        partie.inscrits.forEach(function(inscrit){
            var pseudo = getPseudoJoueurFromId(inscrit);
            var monLi = $('<li>').append($('<a>').text(inscrit).addClass('inscritsId'), "  -  ", $('<a>').text(pseudo).addClass('inscritsPseudo'));
            $(maListe).append(monLi);
console.log('majInscrits partie : ' + partie.id + ", " + inscrit + " : " + pseudo);
        })
        $(inscritsAutrePartie).append($('<a>').text("nouvel inscrit").addClass('etatInscr').hide().fadeIn(200, function(){
            setTimeout(function(){
                $(inscritsAutrePartie).children('a').fadeOut(500, function(){
                    $(inscritsAutrePartie).children('a').remove();
                })
            },2000);
        }));
    }else{     socket.emit('pbNonGere', "parent non trouvé function MAJInscritsAutrePartie côté client ");}
}
function majMaPartie(partie)
{
console.log("majMaPartie, jmax : " + partie.nbJMax + ", min : " + partie.nbJMin);
    if(parseInt($('#maPartieId').text().trim()) == partie.id)
    {      
        $('#mesInscrits').children('').remove();
        partie.inscrits.forEach(function(idI){
            var pseudo = getPseudoJoueurFromId(idI);
            var newLi = $('<li>').text(idI + " - " + pseudo);    
            $('#mesInscrits').append(newLi);
        })
        if(partie.inscrits <= partie.nbJMax && partie.inscrits>=partie.nbJMin)
        {
            $('#lancerMaPartie').prop('disabled', false);
        }else{$('#lancerMaPartie').prop('disabled', true);}
    }else{alert("id non correspondante majMaPartie");   }
}
function majInscritsAutrePartie(eleminscritsAutrePartie, partie)
{
    $(eleminscritsAutrePartie).children('').remove();
    var monUl = $('<ul>');
    partie.inscrits.forEach(function(unInscrit){ // itération des id inscrits
console.log("majInscritsAutrePartie:  recherche inscrits parmi : ");
console.log(unInscrit);
console.log("carnet j : " + window.joueurs.length);
        window.joueurs.forEach(function(j){
console.log(j.id + "  -  " + j.pseudo);
console.log(j.id + "  ==  " + unInscrit + " ? ");
            if(parseInt(j.id) == parseInt(unInscrit)){
console.log("oui");
     //           $(monUl).append($('<li>').append($('<a>').text(j.id).addClass('inscritsId') + " - " + $('<a>').text(j.pseudo).addClass('inscritsPseudo')));
               /* var textID = $('<a>').text(j.id).addClass('inscritsId');
                var textPseudo = $('<a>').text(j.pseudo).addClass('inscritsPseudo');
                var newLi = $('<li>').append(textID + " - " + textPseudo);
                $(monUl).append(newLi);*/
                var newLi = $('<li>').append($("<a>").text(j.id).addClass('inscritsId'), "  -&  ", $("<a>").text(j.pseudo).addClass('inscritsPseudo'));
                $(monUl).append(newLi);

console.log("ajout du joueur : " + j.pseudo);
                $(eleminscritsAutrePartie).append(monUl);
            }
        })   
    })
}
function getPartieFromId(idP)
{
    var laPartie = false;
console.log('getPartieFromId : window.parties, nb : ' + window.parties.length);
    if(window.parties.length == 0){return false;}
    window.parties.forEach(function(p){
console.log('if(p.id == idP)' + p.id + ", idP : " + idP);
        if(p.id == idP)
        {
            laPartie = p;
        }
    })
console.log('getPartieFromId : partie : ' + laPartie.id + ", " + laPartie.jeu + ", " + laPartie.date_creation + ', LANCEUR : ' + laPartie.idLanceur);
    return laPartie;
}
function addAutrePartie(partie)
{
    var divEnglobante = $('<div>').addClass('autresParties col-md-6').css('backgroundColor', maCouleur());
    var row = $('<div>').addClass('row');
    var informationsUnePartie = $('<div>').addClass('col-md-4 infosUnePartie').css('backgroundColor', "blue").css('opacity', 0.6);
    var inscritsAutrePartie = $('<div>').addClass('col-md-4 inscritsAutrePartie').css('backgroundColor', "white").css('opacity', 0.6).text("test inscris");
    var interactionsUnePartie = $('<div>').addClass('col-md-4 interacUnePartie').css('backgroundColor', "red").css('opacity', 0.6);
    var a1 = $('<a>').text(partie.id).addClass('idAutrePartie badge').css('backgroundColor', maCouleur());
    var a2 = $('<a>').text(partie.jeu).addClass('jeuAutrePartie');
    var a3 = $('<a>').text(partie.date_creation).addClass('dateAutrePartie');
    var aEtatInscr = $('<a>').addClass('etatInscr');
    var bouton = $('<button>').text("S'inscrire").addClass('sInscrire');
    $(informationsUnePartie).append(a1, a2,"<br />", a3);
    majInscritsAutrePartie($(inscritsAutrePartie), partie);
    $(interactionsUnePartie).append(bouton, "<br />", aEtatInscr);
    $('#containerAutresParties').append(divEnglobante);
    $(divEnglobante).append(informationsUnePartie, inscritsAutrePartie, interactionsUnePartie).hide().fadeIn(1000);
    refreshSInscrire();
}
socket.on('majListJoueurs', function(listeJoueurs){
    majListeJoueurs(listeJoueurs);
console.log("client : " + window.joueur.pseudo + " recep listJoueurs : nb : " + listeJoueurs.length);
listeJoueurs.forEach(function(j){
    console.log(j.id + " - " + j.pseudo);
    })
console.log("window.joueurs.length : nb : " + window.joueurs.length);
listeJoueurs.forEach(function(j){
    console.log(j.id + " - " + j.pseudo);
    })
});
// a suppr ensuite ? (PAS window.joueurs (MAJ à chaque co / deco))
socket.on('majMyParties' , function(parties){
    window.parties = parties;
});
socket.on('listParties' , function(parties){
console.log("recep listParties, nb : " + parties.length);
    parties.forEach(function(p){addAutrePartie(p);
console.log('partie : ' + p.id + ", nb inscrits : " + p.inscrits.length);})
});
socket.on('votreJoueur', function(joueur){
    window.joueur = joueur;
});
socket.on('initClient' , function(data){
    window.parties = data['parties'];
    majListeJoueurs(data['joueurs']);
    window.parties.forEach(function(p){
console.log('Recp Init parties : ' + p.id + "  -  id Lanceur  :  " + p.idLanceur)
        addAutrePartie(p);
    })
});
socket.on('votreNouvellePartie' , function(partie){
 //   window.parties.push(partie);

    $('#maPartieId').text(partie.id);
    $('#maPartieJeu').text(partie.jeu);
    $('#maPartieDateCreation').text(partie.date_creation);
    $('#pasDeMaPartie').css("visibility", "hidden");
    $('#advertPartie').text("votre partie a bien été créee.").hide().css("visibility", "visible")
        .fadeIn(1000, function(){
            setTimeout(function(){
                $('#advertPartie').css("visibility", "hidden");
            }, 2000);
        });
    amIInscrisTrue();
console.log("votreNouvellePartie " + partie.id + ", nb inscrits : " + partie.inscrits.length);
});
socket.on('nouvellePartie' , function(partie){
    addAutrePartie(partie);
    socket.emit("majMyParties");
});
socket.on('annulationPartie' , function(idPartie){
    var divEnglobanteParente;
 //   var compteur = 0;
    var parentTrouve = false;
console.log('recep annulationPartie : ' + idPartie);
    $('.idAutrePartie').each(function(elemId){
 console.log('each ; val : ' + $(this).text());
        if(idPartie == parseInt($(this).text().trim()))
        {
            divEnglobanteParente = $(this).parent().parent();
            parentTrouve = true;
        }
    })
    if(parentTrouve)
    {
        $(divEnglobanteParente).addClass('unePartieAnnulee');
        var divInterac = $(divEnglobanteParente).children('.interacUnePartie');
        var monBouton = $(divInterac).children('button');
        $(monBouton).css('color', 'red').prop('disabled', true).addClass('boutonNOK');
        var affichAnnulee = $('<a>').text("annulée").addClass("affichAnnulee");
        $(divInterac).append(affichAnnulee);
        setTimeout(function(){
            $(divEnglobanteParente).remove();
        }, 2000); // les parties annulées disparaissent après 2 secondes
    }else{     socket.emit('pbNonGere', "parent non trouvé sur socket.on 'annulationPartie' côté client ");}
    amIInscrisTrue();
    socket.emit("majMyParties");
});
socket.on('VotrePartieAnnulee' , function(data){
    
    $('#advertPartie').text("partie annulée.").hide().css("visibility", "visible")
        .fadeIn(1000, function(){
            setTimeout(function(){
                $('#maPartieCree').fadeOut(1000, function(){
                    $('#advertPartie').hide();
                    $(this).css("visibility", "hidden");
                    document.getElementById('lancerPartie').disabled = false;
                    document.getElementById('nvllePartie').disabled = false;
                    $('#maPartieId').text("");
                    $('#maPartieJeu').text("");
                    $('#maPartieDateCreation').text("");
                    $("#pasDeMaPartie").hide().css("visibility", "visible").fadeIn(800);
                });
                amIInscrisFalse();
                var part  = getPartieFromId(data['idPartie']);
                if(window.joueur.id != part.idLanceur){supprPartie(data['idPartie']);}
                socket.emit("majMyParties");
            }, 2000);
        });
        
});
socket.on('validInscr' , function(data){ // data['idJ'] et idP
    var divEnglobante = $(window.autrePartie);
    var informationsUnePartie = $(divEnglobante).children('.infosUnePartie');
    var interactionsUnePartie = $(divEnglobante).children('.interacUnePartie');
    var monButt = $(interactionsUnePartie).children('button');
    var idPartie = parseInt($(informationsUnePartie).children('.idAutrePartie').text().trim());
    var etatInscr = $(divEnglobante).children().children('.etatInscr');
    if(data['idP'] == idPartie)
    {
        if(data['idJ'] == window.joueur.id) // on peut procéder inscr sereinement
        {
            $(etatInscr).css('border', 'groove 8px red');       // etatInscr inchopable ! 
            $(etatInscr).text("inscription validée ! ");
            amIInscrisTrue(); $(monButt).prop("disabled", false);
            partie = getPartieFromId(data['idP']);
            MAJInscritsAutrePartie(data['idJ'], partie);
//addInscritAtPartie(data['idJ'], data['idP']);
         /*   $(etatInscr).fadeOut(500, function(){
                $(this).removeClass('etatInscrAttente').addClass('etatInscr').text("inscription OK").fadeIn(500);
});*/
            $(monButt).prop('disabled', false);
        }else{socket.emit('pbNonGere', "cote client socket.on('validInscr') : non correspondance idJ envoyé et window.joueur.id " );      } // y a eu un couac
    }else{socket.emit('pbNonGere', "cote client socket.on('validInscr') : non correspondance idPart envoyé et DOM trouvé (window.autrePartie)" );      } // y a eu un couac
    socket.emit("majMyParties");
});
socket.on('validDesinscr' , function(data){ // data['idJ'] et idP

    var divEnglobante = $(window.autrePartie);
    var informationsUnePartie = $(divEnglobante).children('.infosUnePartie');
    var interactionsUnePartie = $(divEnglobante).children('.interacUnePartie');
    var monButt = $(interactionsUnePartie).children('button');
    var idPartie = parseInt($(informationsUnePartie).children('.idAutrePartie').text().trim());
var etatInscr = $(interactionsUnePartie).children('.etatInscr');
    if(data['idP'] == idPartie)
    {
        if(data['idJ'] == window.joueur.id) // on peut procéder inscr sereinement
        {
            var partie = getPartieFromId(data['idP']);
console.log('partie recup : ' + partie.id + ", " + partie.idLanceur);
            partie.supprJoueur(window.joueur.id);
            MAJInscritsAutrePartie(data['idJ'], partie);
$(etatInscr).text("désinscription validée ! ");
         /*   $(etatInscr).fadeOut(500, function(){
                $(this).removeClass('etatInscrAttente').addClass('etatInscr').text("inscription OK").fadeIn(500);
});*/
            $(".sInscrire").prop('disabled', false);
        }else{socket.emit('pbNonGere', "cote client socket.on('validDesinscr') : non correspondance idJ envoyé et window.joueur.id " );      } // y a eu un couac
    }else{socket.emit('pbNonGere', "cote client socket.on('validDesinscr') : non correspondance idPart envoyé et DOM trouvé (window.autrePartie)" );      } // y a eu un couac
    window.autrePartie = null;
    amIInscrisFalse();
    socket.emit("majMyParties");
});
socket.on('validInscrKO' , function(data){ // data['idJ'] et idP

            // traitement ... ? 
    window.autrePartie = null;
    socket.emit("majMyParties");
});
socket.on('nouvelleInscrAUnePartie' , function(data){ // data['idJ'] et idP
console.log(window.joueur.pseudo + ", recep nouvelleInscrAUnePartie, data['idJ'] :" + data['idJ'] + ", data['idP']" + data['idP']);
    var partie = getPartieFromId(data['idP']);
console.log('nouvelleInscrAUnePartie ' + partie.id + ", nb inscrits : " + partie.inscrits + ", data['idP'] : " + data['idP']);
    partie.addJoueur(data['idJ']);
    if(window.joueur.id == partie.idLanceur){    majMaPartie(partie); 
console.log("vous etes le lanceur.");    }
    else{   
            MAJInscritsAutrePartie(data['idJ'], partie);
//  addInscritAtPartie(data['idJ'], data['idP']);   
console.log("vous etes inscrits. partie.idLanceur : " + partie.idLanceur + ", data['idJ'] : " + data['idJ']);    }
});
socket.on('nouvelleDesinscrAUnePartie' , function(data){ // data['idJ'] et idP
console.log("nouvelleDesinscrAUnePartie : j " +  data['idJ'] + ", p : " +  data['idP']);
    var partie = getPartieFromId(data['idP']);
    partie.supprJoueur(data['idJ']);
    if(partie.idLanceur == window.joueur.id){majMaPartie(partie);}
    else{MAJInscritsAutrePartie(data['idJ'], partie);}
    socket.emit("majMyParties");
});
$(function(){
    var monPseudo = $('#bienvenueJ').text();  // récupération du pseudo
    document.getElementById('lancerPartie').disabled = true;
    socket.emit('getMoiJoueur', monPseudo); // à reception serveur : recupère la socket id
    socket.emit('initClient');      // le serveur renverra la liste des joueurs, des parties
    /*socket.emit('getListJoueurs');
    socket.emit('getListParties', "svp");*/
    
    window.onbeforeunload = function() {
        socket.emit('deconnexion', window.joueur.id);
    }
    $('#quitter').click(function(){
        $('#quitterForm').submit();
    });
    $('#nvllePartie').change(function(){
        if($(nvllePartie).val() != "Sélectionner" && !amIInscris){    document.getElementById('lancerPartie').disabled = false;     }
        else{     document.getElementById('lancerPartie').disabled = true;      }
    });
    $('#lancerPartie').click(function(){
        amIInscrisTrue();
        $('#maPartieCree').css('visibility', 'visible').hide().fadeIn(1000);
        $('#descriptifMaPartie').text("Vous avez lancé une partie de "+ $(nvllePartie).val());
        var donnees = {
            'pseudo': monPseudo, 
            'jeu': $(nvllePartie).val()
        };
        socket.emit('nouvellePartie', donnees);
    });
    $('#annulerMaPartie').click(function(){
        var donnees = {
            idPartie: parseInt($('#maPartieId').text().trim()),
            pseudo: monPseudo.trim()
        };
        socket.emit('annulerMaPartie', donnees);
        amIInscrisFalse();
    });
// que pour le dev 
    $('#afficherListParties').click(function(){
        socket.emit('getListParties', "pleaze ! ");
    });
    $('#afficherJoueurs').click(function(){
        console.log('click afficherJoueurs OK');
        socket.emit('getListJoueurs');
    });
    $('#testMySocket').click(function(){
        socket.emit('testMySocket', window.joueur.id);
    });
    $('#testMyJoueurs').click(function(){
        console.log("window.joueurs : ");
        window.joueurs.forEach(function(j){
            console.log(j.id + "  -  " + j.pseudo);
        })
    });
    $('#MAJMyJoueurs').click(function(){
        console.log("MAJMyJoueurs : ");
        socket.emit('getListJoueurs');
    });
    $('#amIInscris').click(function(){
        console.log("amIInscris  ? : " + window.amIInscris);
    });
    socket.on('testSocket' , function(mess){ 
            console.log("Reception socket : " + mess);
    });
});