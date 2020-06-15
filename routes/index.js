var express = require('express');
const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');
var router = express.Router();

function getCal(username){

}

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});





module.exports = router;
