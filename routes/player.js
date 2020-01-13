var express = require('express');
var router = express.Router();

router.get('/match', (req, res, next) => {
  res.render('match');
});

router.get('/match/create', (req, res, next) => {
  res.render('create-new-room');
});

module.exports = router;
