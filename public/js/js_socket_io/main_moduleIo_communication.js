exports.loadIoModules = function(server)
{
    console.log('mainIO');
    var io = require('socket.io').listen(server);

    io.sockets.on('connection', function (socket) {
        console.log('client connecte ...');

        require("./moduleIo_com_inscription_connexion.js").comInscr(socket);
        require("./moduleIo_com_connecte.js").comCo(socket);
    });
}