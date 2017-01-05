window.joueur; // concerne le joueur client de cette page
window.joueurs; // les autres joueurs connectés
window.amIInscris = false;  // passera à false à l'inscription puis à true à désinscription, fin partie ou annulation partie
window.autrePartie = null; // ici sera stockée la div englobante (ex pour retrouver l'affichage sur une demande d'inscription)

// com .io 
var socket = io.connect('http://localhost:8080');

function majListeJoueurs(listeJoueurs)
{
    console.log('maj liste joueurs' + listeJoueurs.length);
    $('#listeJoueurs li').remove();
    var list=[];
    listeJoueurs.forEach(function(joueur){
        $('#listeJoueurs').append($('<li>').text(joueur.pseudo));
    })
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
            $(aEtatInscr).hide().text("désinscription demandée").fadeIn(500);
            $(buttInscr).text("S'inscrire");  // possibilité d'ajouter une vérification avec .val(inscription); (qui ne modifie pas le texte mais simplement la avaleur du bouton)
            $('.sInscrire').prop('disabled', true); // en attente de la réponse serveur, tous les boutons sInscrire se disablent
            window.amIInscris = false;
            var dataDesinscr = {
                idJ: window.joueur.id,
                idP: idPartie
            };
            socket.emit('desinscription', dataDesinscr);
        }else{      // sinon je m'inscris
            $(aEtatInscr).hide().text("inscription demandée").fadeIn(500);
            $(buttInscr).text("Se désinscrire");
            $('.sInscrire').prop('disabled', true);
            window.amIInscris = true;
            var dataInscr = {
                idJ: window.joueur.id,
                idP: idPartie
            };
            socket.emit('inscription', dataInscr);
        }
        window.autrePartie = $(divEnglobante);
    });
}
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
function addAutrePartie(partie)
{
    var divEnglobante = $('<div>').addClass('autresParties col-md-6').css('backgroundColor', maCouleur());
    var row = $('<div>').addClass('row');
    var informationsUnePartie = $('<div>').addClass('col-md-6 infosUnePartie');
    var interactionsUnePartie = $('<div>').addClass('col-md-6 interacUnePartie');
    var a1 = $('<a>').text(partie.id).addClass('idAutrePartie badge').css('backgroundColor', maCouleur());
    var a2 = $('<a>').text(partie.jeu).addClass('jeuAutrePartie');
    var a3 = $('<a>').text(partie.date_creation).addClass('dateAutrePartie');
    var aEtatInscr = $('<a>').addClass('etatInscr');
    var bouton = $('<button>').text("S'inscrire").addClass('sInscrire');
    $(informationsUnePartie).append(a1, a2,"<br />", a3);
    $(interactionsUnePartie).append(bouton, "<br />", aEtatInscr);
    $('#containerAutresParties').append(divEnglobante);
    $(divEnglobante).append(informationsUnePartie, interactionsUnePartie).hide().fadeIn(1000);
    refreshSInscrire();
}
socket.on('majListJoueurs', function(listeJoueurs){
    majListeJoueurs(listeJoueurs);
console.log("recep listJoueurs : nb : " + listeJoueurs.length);
listeJoueurs.forEach(function(j){
    console.log(j.id + " - " + j.pseudo);
})
});
socket.on('listParties' , function(parties){

    console.log('recp liste parties, nb : ' + parties.length);
    parties.forEach(function(p){
        console.log('id : ' + p.id + ", lanceur : " + p.idLanceur + ", nb inscrits : " + p.inscrits.length + ", date création = " + p.date_creation);
        p.inscrits.forEach(function(i){
            console.log(i);
        })
    })
    /*var compteur = 0;
    data["list2Parties"].forEach(function(partie){
        console.log("partie n " + partie.id + ", " + partie.jeu + " est " + partie.etat + " . inscrits : ");
        data["listDInscrits"][compteur].forEach(function(inscrit){
            console.log(inscrit);
        })
        compteur ++;
    })*/
});
socket.on('votreJoueur', function(joueur){
    window.joueur = joueur;
});
socket.on('votreNouvellePartie' , function(partie){
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
console.log("votreNouvellePartie " + partie.id + ", nb inscrits : " + partie.inscrits.length);
});
socket.on('nouvellePartie' , function(partie){
    addAutrePartie(partie);
});
socket.on('annulationPartie' , function(idPartie){
    var divEnglobanteParente;
    var compteur = 0;
    var parentTrouve = false;
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
    }else{     socket.emit('pbNonGere', "parent non trouvé sur socket.on 'annulationPartie' côté client ");     }
});
socket.on('VotrePartieAnnulee' , function(mess){
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
            }, 2000);
        });
});
socket.on('vousAvezEteDesinscris' , function(mess){
// desinscription par exemple qd un membre a annulé sa partie

/*  $('#advertPartie').text("partie annulée.").hide().css("visibility", "visible")
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
            }, 2000);
    });*/
});
socket.on('validInscr' , function(data){ // data['idJ'] et idP
    var divEnglobante = $(window.autrePartie);
    var informationsUnePartie = $(divEnglobante).children('.infosUnePartie');
    var interactionsUnePartie = $(divEnglobante).children('.interacUnePartie');
    var monButt = $(interactionsUnePartie).children('button');
    var idPartie = parseInt($(informationsUnePartie).children('.idAutrePartie').text().trim());
    var etatInscr = $(divEnglobante).children('.etatInscr');
//  $(interactionsUnePartie).css('backgroundColor', 'purple').css('color', 'green');
    if(data['idP'] == idPartie)
    {
        if(data['idJ'] == window.joueur.id) // on peut procéder inscr sereinement
        {
            $(etatInscr).css('border', 'groove 8px red');       // etatInscr inchopable ! 
            $(etatInscr).text("inscription validée ! ");
         /*   $(etatInscr).fadeOut(500, function(){
                $(this).removeClass('etatInscrAttente').addClass('etatInscr').text("inscription OK").fadeIn(500);
});*/
            $(monButt).prop('disabled', false);
        }else{$(".sInscrire").prop('disabled', false); socket.emit('pbNonGere', "cote client socket.on('validInscr') : non correspondance idJ envoyé et window.joueur.id " );      } // y a eu un couac
    }else{  $(".sInscrire").prop('disabled', false); socket.emit('pbNonGere', "cote client socket.on('validInscr') : non correspondance idPart envoyé et DOM trouvé (window.autrePartie)" );      } // y a eu un couac
    window.autrePartie = null;
});
socket.on('validDesinscr' , function(data){ // data['idJ'] et idP
    var divEnglobante = $(window.autrePartie);
    var informationsUnePartie = $(divEnglobante).children('.infosUnePartie');
    var interactionsUnePartie = $(divEnglobante).children('.interacUnePartie');
    var monButt = $(interactionsUnePartie).children('button');
    var idPartie = parseInt($(informationsUnePartie).children('.idAutrePartie').text().trim());
var etatInscr = $(interactionsUnePartie).children('.etatInscr');  // still doesn't works
    if(data['idP'] == idPartie)
    {
        if(data['idJ'] == window.joueur.id) // on peut procéder inscr sereinement
        {
            $(interactionsUnePartie).css('border', 'red');
            $(etatInscr).text("désinscription validée ! ");
         /*   $(etatInscr).fadeOut(500, function(){
                $(this).removeClass('etatInscrAttente').addClass('etatInscr').text("inscription OK").fadeIn(500);
});*/
            $(".sInscrire").prop('disabled', false);
        }else{$(".sInscrire").prop('disabled', false); socket.emit('pbNonGere', "cote client socket.on('validDesinscr') : non correspondance idJ envoyé et window.joueur.id " );      } // y a eu un couac
    }else{  $(".sInscrire").prop('disabled', false); socket.emit('pbNonGere', "cote client socket.on('validDesinscr') : non correspondance idPart envoyé et DOM trouvé (window.autrePartie)" );      } // y a eu un couac
    window.autrePartie = null;
});
socket.on('validInscrKO' , function(data){ // data['idJ'] et idP

            // traitement ... ? 
    window.autrePartie = null;
});
socket.on('nouvelleInscrAUnePartie' , function(data){ // data['idJ'] et idP

            // traitement ... ? 
});
socket.on('nouvelleDesinscrAUnePartie' , function(data){ // data['idJ'] et idP

            // traitement ... ? 
});
$(function(){
    var monPseudo = $('#bienvenueJ').text();  // récupération du pseudo
    document.getElementById('lancerPartie').disabled = true;
    socket.emit('getMoiJoueur', monPseudo); // à reception serveur : recupère la socket id
    socket.emit('getListJoueurs');
    socket.emit('getListParties', "svp");
    
    window.onbeforeunload = function() {
        socket.emit('deconnexion', window.joueur.id);
    }
    $('#quitter').click(function(){
        $('#quitterForm').submit();
    });
    $('#nvllePartie').change(function(){
        if($(nvllePartie).val() != "Sélectionner"){    document.getElementById('lancerPartie').disabled = false;     }
        else{     document.getElementById('lancerPartie').disabled = true;      }
    });
    $('#lancerPartie').click(function(){
        document.getElementById('lancerPartie').disabled = true;
        document.getElementById('nvllePartie').disabled = true;
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
    });
    
// que pour le dev 

    $('#afficherListParties').click(function(){
        socket.emit('getListParties', "pleaze ! ");
    });
    $('#afficherJoueurs').click(function(){
        console.log('click afficherJoueurs OK');
        socket.emit('getListJoueurs');
    });
});