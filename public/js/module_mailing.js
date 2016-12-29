exports.mailIt = function(destinataire, sujet, corpsMessage)
{				
	console.log('mailIt, pseudo : ');
	
//	console.log('mailIt, pseudo : ' + pseudo + ',\n sujet :  ' +  sujet + '\nmessage : ' + corpsMessage);
	var nodemailer = require('nodemailer');
	var smtpTransport = require('nodemailer-smtp-transport');
	
	var options = {
	
		service: "gmail",
		secure: true,
		auth : {
	        user : "noobstudieux@gmail.com",  // voir à sécuriser ces infos ??
	        pass : "no0by!stud"
	    }
	};
	var transporter = nodemailer.createTransport(smtpTransport(options));
	
	transporter.sendMail({
	    from: 'un_bel_et_sombre_inconnu@suspens.org', //semble ne servir à rien
	    to: destinataire,
	    subject: sujet,
	    text: corpsMessage,
	}, function(error, response) {
	   if (error) {
	        console.log(error);
	   } else {
	        console.log('Message d\'inscription envoyé à : ' + destinataire);
	   }
	});
}
