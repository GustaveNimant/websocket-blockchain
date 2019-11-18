'use strict';
var D = require('./debug');

var CryptoJS = require("crypto-js");

var ModuleName = 'outils.js';

function calculateHashForBlock (block) {
    return calculateHash(block.index, block.hashPrecedent, block.horodatage, block.contenu);
};

function calculateHash (index, hashPrecedent, horodatage, contenu) {
    return CryptoJS.SHA256(index + hashPrecedent + horodatage + contenu).toString();
};

function errorHandler (error) {
    if (error.syscall !== 'listen') {
	throw error;
    }
    const address = server.address();
    const bind = typeof address === 'string' ? 'pipe ' + address : 'port: ' + port;
    switch (error.code) {
    case 'EACCES':
	console.error(bind + ' exige des privilèges plus élevés.');
	process.exit(1);
	break;
    case 'EADDRINUSE':
	console.error(bind + ' est déjà utilisé.');
	process.exit(1);
	break;
    default:
	throw error;
    }
};

function errorMessage (expected, found, cure, caller) {
    console.log ('\n\nErreur dans',caller);
    console.log ('On attendait',expected);
    console.log ('On a trouvé',found);
    console.log ('Remède',cure);
    var stack = new Error().stack;
    console.log ('stack',stack);
    throw "exit";
}
function functionNameJS (mod) {
    var stack = new Error().stack;

    if (mod === "main") {
	var caller = ((stack.split('at ')[2]).split(' ')[0]);
    }
    else {
	var AtNeW = stack.split('at new ')[1];
	if (AtNeW == undefined) {
	    var At = stack.split('at ');
	    var caller = ((At[2]).split(' ')[0])
	    if (caller == undefined) {
		console.log('stack',stack);
	    }
	}
	else {
	    var caller = AtNeW.split(' ')[0];
	}
    }
    
    return mod + ':' + caller.replace('Object.', '');
}

function getLatestElement (elementArray) {
    var here = functionNameJS(ModuleName);
    var result = elementArray[elementArray.length - 1];
//    if (D.debug) {console.log('Sortie  de',here,'result',result);}
    return result;
};

function isValidEmail (email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    var result = (re.test(String(email).toLowerCase()));
    if (D.debug) {console.log('result',result);}
    return result;
}

function normalizePort (val) {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    return val;
  }
  if (port >= 0) {
    return port;
  }
  return false;
};


module.exports.calculateHash = calculateHash;
module.exports.calculateHashForBlock = calculateHashForBlock;
module.exports.errorMessage = errorMessage;
module.exports.functionNameJS = functionNameJS;
module.exports.getLatestElement = getLatestElement;
module.exports.isValidEmail = isValidEmail;
module.exports.normalizePort = normalizePort;

