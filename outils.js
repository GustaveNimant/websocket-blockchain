'use strict';
var CryptoJS = require("crypto-js");

var ModuleName = 'outils.js';

function calculateHashForBlock (block) {
    return calculateHash(block.index, block.previousHash, block.timestamp, block.data);
};

function calculateHash (index, previousHash, timestamp, data) {
    return CryptoJS.SHA256(index + previousHash + timestamp + data).toString();
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
    console.log('Sortie  de',here,'result',result)
    return result;
};

function isValidEmail (email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	var result = (re.test(String(email).toLowerCase()));
	console.log('result',result);
	return result;
    }


module.exports.calculateHash = calculateHash;
module.exports.calculateHashForBlock = calculateHashForBlock;
module.exports.errorMessage = errorMessage;
module.exports.functionNameJS = functionNameJS;
module.exports.getLatestElement = getLatestElement;
module.exports.isValidEmail = isValidEmail;


