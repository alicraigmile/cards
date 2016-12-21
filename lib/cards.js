var _ = require('underscore'),
		promise = require('bluebird'),
		GoogleSpreadsheet = require('google-spreadsheet'),
		sheetId = '1FuV6Z2oK5mkmJXr2aMZT_xCeRtgGBprdT6Um8qn3bDU',
		doc = new GoogleSpreadsheet(sheetId),
        pug = require('pug'),
		sheet,
		rowCount;

function setAuth() {
    
    var credentials = {
        client_email: process.env.CLIENT_EMAIL,
        private_key:  process.env.PRIVATE_KEY
    };

    return new Promise(function(success, failure) {

        if (! credentials.client_email) {
            failure('CLIENT_EMAIL env variable not set');
        } else if (! credentials.private_key) {
            failure('PRIVATE_KEY env variable not set');
        }

        doc.useServiceAccountAuth(credentials, success);
	});
}

function getInfo() {
	return new Promise(function(success, failure) {

		doc.getInfo(function(err, info) {
			if (err) {
				failure(err);
				return;
			}
			console.log('Loaded doc: '+info.title+' by '+info.author.email);
			sheet = info.worksheets[0];
			console.log('sheet 1: '+sheet.title+' '+sheet.rowCount+'x'+sheet.colCount);
			rowCount = sheet.rowCount;
			success();
		});

	});
i }

function getData() {
	return new Promise(function(success, failure) {

    sheet.getRows({
      offset: 1,
      limit: rowCount,
      orderby: 'col2'
    }, function( err, rows ){
/*
			_.each(rows, function(item) {
				console.log(item['title']);
				console.log(item['t-shirtsize']);
				console.log(item['devtime']);
				console.log(item['elapsedtime']);
				console.log(item['elapsedtime']);
			});
*/

			_.each(rows, function(item) {
				var keywords = item.keywords.split(',').map( function(str) { return str.trim(); });
				item.keywords = keywords; // _.map(keywords, function(keyword) { return {keyword:keyword} });

			var hasItem = function(str) {
				return ! _.isEmpty(str);
			};

				var howlist = item.howelevatorpitch.split('. ').filter(hasItem).map( function(str) { return str.trim() });
				item.howlist = howlist;
			
			});


			var hasTitle = function(obj) {
				return ! _.isEmpty(obj.title);
			};

			var goodRows = _.chain(rows)
											.filter(hasTitle)
											.value();

      console.log('Read '+rows.length+' rows');

			success(goodRows);
 
    });
  });
};

function render(rows) {
 return new Promise(function(success, failure) {
	var options = '';
	try {
	var html = pug.renderFile('./views/cards.pug', {rows: rows});
	success(html);
	} catch(err) {
		failure('render error: ' + err);
	}
});

}


/*
setAuth()
	.then(getInfo)
	.then(getData)
	.then(render)
	.then(console.log)
	.catch(console.log);
*/

module.exports = {
	get: function() {
		return setAuth().then(getInfo).then(getData);
  }
}
