var _ = require('underscore'),
	promise = require('bluebird'),
	GoogleSpreadsheet = require('google-spreadsheet');
    utils = require('./utils');

function CardSpreadsheet(sheetId) {
	this.sheetId = sheetId;
    this.doc = new GoogleSpreadsheet(sheetId);
	this.sheet = null; //call setAuth() then getInfo() before using this
}

CardSpreadsheet.prototype.getCards = function() {

    var errorHandler = function(err) {
        console.log('caught an error from setAuth')
        throw new Error('failed to log in: ' + err);
    };

    return this.setAuth()
              .then(_.bind(this.getInfo, this))
              .then(_.bind(this.getData, this));
}

CardSpreadsheet.prototype.setAuth = function() {
	var doc = this.doc,
        credentials = {
            client_email: process.env.CLIENT_EMAIL,
            private_key:  process.env.PRIVATE_KEY
        };

    //work around for AWS elastic beanstalk where multi-libe env vars are not supported
    if (credentials.private_key) {
        credentials.private_key = credentials.private_key.replace(/\\n/g, "\n");
    }
    
    return new Promise(function(resolve, reject) {

        var callback = function(data) {
            if (data) {
                console.log(credentials);
                console.log('auth data: ' + data);
                console.log('assuming this means there was an error authenticating');
                reject(data);
            } else {
                resolve(data);
            }
        };

        if (! credentials.client_email) {
            failure('CLIENT_EMAIL env variable not set');
        } else if (! credentials.private_key) {
            failure('PRIVATE_KEY env variable not set');
        }

        doc.useServiceAccountAuth(credentials, callback);
    });
}

CardSpreadsheet.prototype.getInfo = function() {
    var that = this;

	return new Promise(function(success, failure) {
		that.doc.getInfo(function(err, info) {
			if (err) {
				failure(err);
				return;
			}
			console.log('Loaded doc: '+info.title+' by '+info.author.email);
		    that.sheet = info.worksheets[0];
			console.log('sheet 1: '+that.sheet.title+' '+that.sheet.rowCount+'x'+that.sheet.colCount);
			success();
		});

	});
i }

CardSpreadsheet.prototype.getData = function() {
  var sheet = this.sheet;

	return new Promise(function(success, failure) {

        sheet.getRows({
          offset: 1,
          limit: sheet.rowCount,
          orderby: 'col2'
        }, function( err, rows ){

                var index = 1;
    			_.each(rows, function(item) {
    				var keywords = item.keywords.split(',').map( function(str) { return str.trim(); });
    				item.keywords = keywords;

    				var howlist = item.howelevatorpitch.split('. ').filter(utils.hasItem).map( function(str) { return str.trim() });
    				item.howlist = howlist;
    			
                    item.index = index++;
    			});

    			var goodRows = _.chain(rows)
    							.filter(utils.hasTitle)
    							.value();

                console.log('Read '+rows.length+' rows');
    			success(goodRows);
        });
    });
};

module.exports = CardSpreadsheet;
