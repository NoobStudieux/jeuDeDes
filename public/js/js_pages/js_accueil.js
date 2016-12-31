function credentialsChecker()
			{
				if(pseudoChecker($('#inscrPseudo').val())
				&&	(passwordChecker($('#inscrPassword').val())) 
				&&	($('#inscrPassword').val() == $('#inscrPasswordConfirm').val())
				&&	(emailChecker($('#inscrEmail').val())))
				{
					document.getElementById('inscrValid').disabled = false;
					return true;
				}else{		document.getElementById('inscrValid').disabled = true;	return false;	}
			}
			function pseudoChecker(pseudo)
			{
				// ne vérifiera que le format (pas en bdd)
				if(/^[a-zA-Z0-9\-\_]{2,14}$/.test(pseudo))
				{
					return true;
				}else{		
					return false;		}
			}
			function passwordChecker(password)
			{
				if(/^[a-zA-Z0-9\-\_]{5,18}$/.test(password))
				{
					return true;
				}else{		
					return false;		}
			}
			function emailChecker(mel)
			{
				if(/^[a-zA-Z0-9\_\-.]{1,30}\@[a-zA-Z0-9.\_\-]{2,20}\.[a-zA-Z0-9]{2,5}$/.test(mel))
				{
					return true;
				}else{	return false;	}
			}
				$(function(){
//  $('#formulaireConnec').submit(function(){  return false;  });		// lasoumission du formaulaire ne sera valider que sur des id corrects
				// init éléments : 
					$('input').addClass('form-control');
					$('input').val('');
					document.getElementById('inscrValid').disabled = true;
					document.getElementById('Connexion').disabled = true;
					$('#errConnec').hide();
				
				// init sockets : 
					// init io socket
					var socket = io.connect('http://localhost:8080');
//	GESTION INSCRIPTION					
					$('#inscrPseudo').keyup(function(){
						if(pseudoChecker($(this).val()))
						{
							$(this).parent('span').removeClass('has-success').removeClass('has-error').addClass('has-warning');
							$('#inscrValid').css('color','black');
							$('#explPseudoInscr').removeClass('explicationsNOK').addClass('explicationsOK').text('OK');
							socket.emit('isDispoPseudo',$(this).val());
							credentialsChecker();
					}
						else
						{
						// afficher bulle aide
							$(this).parent('span').removeClass('has-success').removeClass('has-warning').addClass('has-error');
							$('#inscrValid').css('color','gray');
							$('#explPseudoInscr').removeClass('explicationsOK').addClass('explicationsNOK').text('pseudo non correctement formé');
						}
						credentialsChecker();
					});
					socket.on('isDispoPseudo', function(isPseudoDispo){
						if(isPseudoDispo)
						{
							var spanParent = $('#inscrPseudo').parent('span');
							$(spanParent).removeClass('has-error').removeClass('has-warning').addClass('has-success');
						//	$('#logoPseudoInscr').addClass("glyphicon glyphicon-ok");
							$('#explPseudoInscr').removeClass('explicationsNOK').addClass('explicationsOK').text('le pseudo est disponible'); // addClass("glyphicon glyphicon-ok");
						}
						else
						{
							var spanParent = $('#inscrPseudo').parent('span');
							$(spanParent).removeClass('has-success').removeClass('has-warning').addClass('has-error');
							$('#explPseudoInscr').removeClass('explicationsOK').addClass('explicationsNOK').text('le pseudo est déjà pris !'); // addClass("glyphicon glyphicon-ok");
						}
						var child = $(spanParent).children('.champInscrLogo');
						$(child).text('zop là');
					});
					
					$('#inscrPassword').keyup(function(){
						if(passwordChecker($(this).val()))
						{
							$(this).parent('span').removeClass('has-warning').removeClass('has-error').addClass('has-success');
							$('#inscrPasswordConfirm').parent('span').removeClass('has-success').removeClass('has-error').addClass('has-warning');
							$('#verifDispoPseudo').css('color','black');
						//	if($(this).val() == )
							//{
							$('#mdpInscr').removeClass('explicationsNOK').addClass('explicationsOK').text('Mot de passe OK');
							//}
							//else{			}
						}
						else
						{
			// afficher bulle aide
							$(this).parent('span').removeClass('has-success').removeClass('has-warning').addClass('has-error');
							$('#inscrValid').css('color','gray');
							$('#mdpInscr').removeClass('explicationsOK').addClass('explicationsNOK').text('Mot de passe trop court ou caractère interdit');
						}
						//}
						credentialsChecker();
					});
					
					$('#inscrPasswordConfirm').keyup(function(){
							if(passwordChecker($(this).val())
							&& ($(this).val() == $('#inscrPassword').val()))
							{
								$(this).parent('span').removeClass('has-warning').removeClass('has-error').addClass('has-success');
							//	$('#inscrPasswordConfirm').removeClass('explicationsNOK').addClass('explicationsOK').text('Mot de passe trop court ou caractères interdit');
							}
							else
							{
								$(this).parent('span').removeClass('has-success').removeClass('has-warning').addClass('has-error');
								if(passwordChecker($(this).val())) // 2 champs != mais compo ok
								{
									$('#mdpConfirmInscr').removeClass('explicationsOK').addClass('explicationsNOK').text('confirmation différente du mot de passe ! ');
								}
							}
							// logo check
							credentialsChecker();
					});
					$('#inscrPasswordConfirm').blur(function(){
							if(passwordChecker($(this).val())
							&& ($(this).val() == $('#inscrPassword').val()))
							{
								$('.mdpOK').removeClass('explicationsNOK').addClass('explicationsOK').text('Mot de passe et confirmation OK');
						
							}
							else{ // info bulle
								$('.mdpOK').removeClass('explicationsOK').addClass('explicationsNOK');
								if(passwordChecker($(this).val()))
								{
									$('.mdpOK').text('Mot de passe et vérification différents !');
								}
								else
								{
									$('.mdpOK').text('Le mot de passe n\'est pas former correctement ()');
								}
							}
					});
					$('#inscrEmail').focus(function(){
							$(this).parent('span').removeClass('has-error').removeClass('has-success').addClass('has-warning');
					});
					$('#inscrEmail').keyup(function(){
							if(emailChecker($(this).val()))
							{
								console.log("mail correect");
								$(this).parent('span').removeClass('has-error').removeClass('has-warning').addClass('has-success');
								socket.emit('isMailDispo',$(this).val());
							}
							else{
								console.log("mail incorreect");
								$(this).parent('span').removeClass('has-success').removeClass('has-warning').addClass('has-error');
								$('#champInscrMailExplications').removeClass('explicationsOK').addClass('explicationsNOK').text('Rentrer un mail correct.');
							}
							credentialsChecker();
					});
					
					socket.on('isMailDispo', function(isMailDispo){
						if(isMailDispo)
						{
							$('#inscrEmail').parent('span').removeClass('has-error').removeClass('has-warning').addClass('has-success');
							$('#champInscrMailExplications').removeClass('explicationsNOK').addClass('explicationsOK').text('ce mail est dispo');
							document.getElementById('inscrValid').disabled = false;
						}else{
							$('#inscrEmail').parent('span').removeClass('has-success').removeClass('has-warning').addClass('has-error');
							$('#champInscrMailExplications').removeClass('explicationsOK').addClass('explicationsNOK').text('ce mail est déjà pris ! ');
							document.getElementById('inscrValid').disabled = true;
						}
					});
					
					$('#inscrValid').click(function(){
						var infosCompte = {
								"pseudo": $('#inscrPseudo').val(),
								"password": $('#inscrPassword').val(),
								"mail": $('#inscrEmail').val()
							};
							
						if(socket.emit('infosCompte', infosCompte)) // pas l'air utile
						{
							console.log('message envoyé');
						}else{		console.log('message PAS envoyé');		}
					});
					socket.on('isInscrOK', function(message){
						alert(message + ",  vous pouvez maintenant vous connecter");
						$('#item1').collapse();
						$('#item2').toggle();
						console.log($('#inscrPseudo').val());
						$('#pseudo').val(String($('#inscrPseudo').val()));
						$('#pseudo').parent('span').removeClass('has-warning').removeClass('has-error').addClass('has-success');

					});
//	GESTION CONNEXION		
					function connecChecker()
					{
						if(pseudoChecker($('#pseudo').val()) 
						&&	pseudoChecker($('#password').val()))
						{
							document.getElementById('Connexion').disabled = false;
						}else{		document.getElementById('Connexion').disabled = true; 		}
					}
					$('#pseudo').keyup(function(){
						if(pseudoChecker($(this).val()))
						{
							$(this).parent('span').removeClass('has-warning').removeClass('has-error').addClass('has-success');
							$('#Connexion').css('color','black');
						}
						else
						{
						// afficher bulle aide
							$(this).parent('span').removeClass('has-success').removeClass('has-warning').addClass('has-error');
							$('#Connexion').css('color','gray');
						}
						connecChecker();
					});
					$('#password').keyup(function(){
						if(pseudoChecker($(this).val()))
						{
							$(this).parent('span').removeClass('has-warning').removeClass('has-error').addClass('has-success');
							$('#Connexion').css('color','black');
						}
						else
						{
						// afficher bulle aide
							$(this).parent('span').removeClass('has-success').removeClass('has-warning').addClass('has-error');
							$('#Connexion').css('color','gray');
						}
						connecChecker();
					});
					$('#Connexion').click(function(){
						var credentials = {
							"pseudo": $('#pseudo').val(), 
							"password": $('#password').val()
						};
						socket.emit('credentials', credentials);
					});
					socket.on('errConnec', function(mess){
				//		$('#formulaireConnec').submit(function(){  return false;  });
						$('#errConnec').css('visibility', 'visible').removeClass("explicationsOK").addClass("explicationsNOK").text(mess).fadeIn(2000);
						setTimeout(function(){
							$('#errConnec').fadeOut(function(){
									$('#errConnec').css('visibility', 'hidden');
								});
							
						}, 5000);
					});
					socket.on('ConnecOk', function(mess){
						$('#errConnec').css('visibility', 'visible').removeClass("explicationsNOK").addClass("explicationsOK").text("Connexion OK").fadeIn(2000);
						setTimeout(function(){
							$('#errConnec').fadeOut(function(){
									$('#errConnec').css('visibility', 'hidden');
								}, function(){
									$('#submit').trigger('click');
									});
						}, 1200);
					});
				});