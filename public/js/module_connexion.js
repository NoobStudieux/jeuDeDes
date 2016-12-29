exports.connexion = function(){
	var mysql = require('mysql');

	var connexion = mysql.createConnection({
			host: 'localhost',
			user: 'root',
			password : 'mySqlR00t',
			database : 'arcade'
		});
		
	return connexion;
}