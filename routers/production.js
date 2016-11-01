var express = require('express');
var router = express.Router();
var path = require('path');
var pg = require('pg');
var bodyParser = require('body-parser');
var connectionString = 'postgres://localhost:5432/kmoj';

router.get ('/production', function (req, res){
	console.log ('=================');
});
// router.get for production view

// console.log('in production router');
// router.post for production table
router.post ('/production', function (req, res){
	console.log ('req.body for client is', req.body);
	var client = req.body;
	pg.connect(connectionString, function (err, client, done){
		console.log('In production right now');
		if (err){
			console.log('connection error in client', client);
		} else {
			console.log('in the else now');
			var queryResults = client.query ('INSERT INTO production (contract_id, talent, who, what, site, why, cart_number, producer, complete_date, spot_length) ' +
			 'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
			[req.body.contract_id, req.body.talent, req.body.who, req.body.what,
			req.body.site, req.body.why, req.body.cart_number, req.body.producer, req.body.complete_date, req.body.spot_length]);
		}
		queryResults.on('end', function(){
			done();
			res.send({success: true});
		});//end queryResults for client table

	});//end pg.connect for client table
});//end router.post for client table

module.exports = router;
