var express = require('express'),
    app = express(),
    path = require('path'),
    package = require('../package'),
    cards = require('./cards'),
    config = require('../config');
		

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, '..', 'views'));

app.get('/status',function (req, res) {
    res.json({ app: package.name, version: package.version });
});

app.get('/',function (req, res) {
	cards.get()
	.then(function(cards) {
		res.render('cards', {cards: cards});
	}, function(err) {
		res.status(500).json({code: 'E1', message: err})
	});
});

app.use(express.static(path.join(__dirname, '..', 'public')));

module.exports = app;
