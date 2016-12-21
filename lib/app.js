var express = require('express'),
    app = express(),
    path = require('path'),
    package = require('../package'),
    CardSpreadsheet = require('./cards'),
    config = require('../config');
		

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, '..', 'views'));

app.get('/status',function (req, res) {
    res.json({ app: package.name, version: package.version });
});

app.get('/',function (req, res) {
    res.render('index');
});

app.get('/spreadsheets/',function (req, res) {
    res.redirect('/');
});

app.get('/spreadsheets/:id',function (req, res) {
    var spreadsheetId = req.params.id,
        sheet = new CardSpreadsheet(spreadsheetId);

    sheet.getCards().then(
        function(cards) {
    		res.render('cards', {cards: cards, spreadsheetId: spreadsheetId});
    	}, function(err) {
            var code = 500;
            if (err.includes('HTTP error 400')) {
                code = 400;
            }
            console.log(err);
    		res.status(code).json({code: code, message: err})
    	});
});

app.get('/spreadsheets/:id/:index',function (req, res) {
    var spreadsheetId = req.params.id,
        index = req.params.index,
        sheet = new CardSpreadsheet(spreadsheetId);


    sheet.getCards().then(

        function(cards) {
            if (index < 1 || index > cards.length) {
                res.status(404).json({code: 404, message: 'no such card'});
            } else {
                res.render('cards', {cards: [ cards[index-1] ], index: index,  spreadsheetId: spreadsheetId});
            }
        }, function(err) {
            var code = 500;
            if (err.includes('HTTP error 400')) {
                code = 400;
            }
            console.log(err);
            res.status(code).json({code: code, message: err})
        });
});

// See: .ebextensions for NGINX rules which mean AWS ELB ignores this
app.use('/css', express.static(path.join(__dirname, '..', 'public', 'css')));
app.use('/images', express.static(path.join(__dirname, '..', 'public', 'images')));

module.exports = app;
