var express = require('express');
var router = express.Router();
var admin = require("firebase-admin");

var serviceAccount = require("../serviceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://whoplay-25b53.firebaseio.com"
});
router.get('/match', (req, res, next) => {
  res.render('match');
});
router.get('/match/create', (req, res, next) => {
  res.render('create-new-room');
});
router.get('/match/rooms', (req, res, next) => {
  admin.database().ref('roomsList').child(req.query.key).once('value').then(
    (snapshot) => {
      const values = snapshot.val();
      if (values) {
        console.log(values);
        res.render('room.ejs', {
          title: values.title,
          address: values.address, detailAddr: values.detailAddr
        });
      }
      else {
        res.redirect('/player/match');
      }
    }
  )
});
module.exports = router;
