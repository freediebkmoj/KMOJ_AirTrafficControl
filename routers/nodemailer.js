var express = require ('express');
var nodemailer = require ('nodemailer');
var app = express();
var pg = require ('pg');
var router = express.Router();

//using superadmin gmail account with following credentials:
//username: kmojatc  password: manager@kmoj
//This is being used as a dummy account for presentation purposes
//Future developer will need to use auth. service to encrypt this info.
var transporter = nodemailer.createTransport({
	service: 'Gmail',
	auth: {
		user: 'kmojatc@gmail.com',
		pass: 'manager@kmoj'
	}
});

transporter.sendMail({
	from: 'kmojatc@gmail.com',
	to: 'freddiebell@kmojfm.com',
	subject: 'New contract added to queue!',
	text: 'Please go to Air Traffic Controller to approve a new contract!'
}, function (err, res){
	if (err){
		console.log('error sending mail', err);
	} else {
		console.log('message sent ', res.message);
	}
	transport.close();
});

module.exports = router;
