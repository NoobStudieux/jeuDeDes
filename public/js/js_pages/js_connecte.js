function majListeJoueurs(listeJoueurs)
{
    $('#listeJoueurs li').remove();

    listeJoueurs.forEach(function(joueur){
        $('#listeJoueurs').append($('<li>').text(joueur.pseudo));
    })
}
$(function(){

    var monPseudo = $('#bienvenueJ').text();  // récupération du pseudo
    document.getElementById('lancerPartie').disabled = true;
    var socket = io.connect('http://localhost:8080');

    socket.emit('jarrive', monPseudo);

    socket.on('majListJoueurs', function(listeJoueurs){
    // départ d'un nouveau joueur
       // suppressionJoueur(pseudoDeco);
       majListeJoueurs(listeJoueurs);
    });
    window.onbeforeunload = function() {
        console.log('deconnexion');
        socket.emit('deconnexion', monPseudo);
    }
    $('#nvllePartie').change(function(){
        if($(nvllePartie).val() != "Sélectionner"){    document.getElementById('lancerPartie').disabled = false;     }
        else{     document.getElementById('lancerPartie').disabled = true;      }
    });
    $('#lancerPartie').click(function(){
        document.getElementById('lancerPartie').disabled = true;
        document.getElementById('nvllePartie').disabled = true;
        $('#containerMesParties').css('visibility', 'visible');
        $('#descriptifMaPartie').text("Vous avez lancé une partie de "+ $(nvllePartie).val());
        console.log($(nvllePartie).val());
        socket.emit('nouvellePartie', {'pseudo': monPseudo, 'jeu': $(nvllePartie).val() });
})
    $('#annulerMaPartie').click(function(){
        $('#containerMesParties').css('visibility', 'hidden');
        document.getElementById('lancerPartie').disabled = false;
        document.getElementById('nvllePartie').disabled = false;
        /*
        var aSuppr = $('#mesParties').children("p, button");
        aSuppr.forEach(function(element){
            $(element).remove();
        })
        */
    });
});