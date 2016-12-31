window.joueur; // concerne le joueur client de cette page
window.joueurs; // les autres joueurs connectés

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
        alert();
        socket.emit('sInscrire', monPseudo);
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
    var bouton = $('<button>').text("S'inscrire").addClass('sInscrire');
    $(informationsUnePartie).append(a1, a2,"<br />", a3);
    $(interactionsUnePartie).append(bouton);
    $('#containerAutresParties').append(divEnglobante);
    $(divEnglobante).append(informationsUnePartie, interactionsUnePartie).hide().fadeIn(1000);
    refreshSInscrire();
}
// com .io 
var socket = io.connect('http://localhost:8080');

socket.on('majListJoueurs', function(listeJoueurs){
    console.log("majListJoueurs");
    majListeJoueurs(listeJoueurs);
});
socket.on('listParties' , function(data){
    var compteur = 0;
    data["list2Parties"].forEach(function(partie){
        console.log("partie n " + partie.id + ", " + partie.jeu + " est " + partie.etat + " . inscrits : ");
        data["listDInscrits"][compteur].forEach(function(inscrit){
            console.log(inscrit);
        })
        compteur ++;
    })
});
socket.on('votreJoueur', function(joueur){
    window.joueur = joueur;
    console.log('recep joueur : ' + joueur.mail);
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
});
socket.on('nouvellePartie' , function(partie){
    addAutrePartie(partie);
});
socket.on('annulationPartie' , function(idPartie){
console.log('annulation partie reçu');
    var divEnglobanteParente;
    var compteur = 0;
    var parentTrouve = false;
//console.log('idsPartie.length :  ' + idsPartie.length + '   typeof :  ' + $(idsPartie[0]).text());
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

$(function(){

    var monPseudo = $('#bienvenueJ').text();  // récupération du pseudo
    document.getElementById('lancerPartie').disabled = true;
    socket.emit('getMoiJoueur', monPseudo); // à reception serveur : recupère la socket id
    socket.emit('getListJoueurs');
    socket.emit('getListParties', "svp");
    
    window.onbeforeunload = function() {
        socket.emit('deconnexion', monPseudo);
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
});