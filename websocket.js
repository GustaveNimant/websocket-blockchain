'use strict';

var WebSocket = require("ws");
var bodyParser = require('body-parser');

var A = require('./arrays');
var B = require('./blockchain.js');
var O = require('./outils');

const {Block} = require ('./block.js');

var ModuleName = 'websocket.js';

var connectToPeerUrl = (peerUrl, caller) => {
    var here = O.functionNameJS(ModuleName); 
    console.log('Entrée dans',here,'appelé par',caller,'avec peerUrl',peerUrl);

    var ws = new WebSocket(peerUrl);
    
    console.log('Dans',here,'création de ws.url',ws.url)
    console.log('Dans',here,'ws.readyState',ws.readyState)
    ws.on('open', () => initConnection(ws, here));
    ws.on('error', () => {
        console.log('Dans',here,'échec de la connexion à ws',ws.url)
    });
    console.log('Sortie  de ',here);
};

var connectToPeerUrls = (newPeers, caller) => {
    var here = O.functionNameJS(ModuleName);
    console.log('\n');
    console.log('Entrée dans',here,'appelé par',caller,'avec',newPeers.length,'newPeers');

    newPeers.forEach((peerUrl) => {
	console.log('dans',here,'boucle sur peerUrl',peerUrl);
        connectToPeerUrl(peerUrl, here);
    });
    console.log('Sortie  de ',here);
};

var handleBlockchainResponse = (message, caller) => {
    var here = O.functionNameJS(ModuleName);
    console.log('\n');
    console.log('Entrée dans',here,'appelé par',caller);
    console.log('Entrée dans',here,'avec message',message);
    console.log('Entrée dans',here,'avec blockChain',A.blockChain);
    
    /* tri sur les indices */
    var receivedBlocks = JSON.parse(message.data).sort((b1, b2) => (b1.index - b2.index));
    var latestBlockReceived = receivedBlocks[receivedBlocks.length - 1];

    if (A.blockChain.length == 0) {
	console.log('dans',here,'appel à B.getGenesisBlock');
	A.blockChain = [B.getGenesisBlock(here)];
    }
    console.log('dans',here,'blockChain',A.blockChain);
    
    var latestBlockHeld = A.blockChain[A.blockChain.length - 1];

    console.log('\n');
    console.log('dans',here,'Tous les Blocs reçus:',receivedBlocks);
        console.log('\n');
    console.log('dans',here,'Dernier  Bloc stocké:',latestBlockHeld);
    console.log('\n');
    console.log('dans',here,'Index du dernier block:',latestBlockHeld.index);
    console.log('dans',here,'Index du block    reçu:',latestBlockReceived.index);
    console.log('\n');
    
    
    if (latestBlockReceived.index > latestBlockHeld.index) {
        console.log('dans',here,'index du dernier Bloc de la blockchain :',latestBlockHeld.index);
	console.log('dans',here,'index du bloc reçu par le pair :',latestBlockReceived.index);
	
        if (latestBlockHeld.hashCourant === latestBlockReceived.hashPrecedent) {
            console.log('dans',here,'Les Hashes correspondent. Nous pouvons appondre le bloc reçu à notre chaîne et le diffuser');
            A.blockChain.push (latestBlockReceived);
            B.broadcast (B.responseLatestMsg(here), here);
        } else if (receivedBlocks.length === 1) {
            console.log('dans',here,'Le block reçu a une longueur de 1. Nous devons interroger notre chaîne depuis notre pair');
            B.broadcast(queryAllMsg(here), here);
        } else {
            console.log('dans',here,'La blockchain reçue est plus longue (',receivedBlocks.length,') que la blockchain actuelle (',latestBlockHeld.index,') la remplacer');
            B.replaceChain(receivedBlocks, here);
        }
    } else {
	if (latestBlockReceived.index == 0) {
            console.log('dans',here,'La blockchain a reçu un Bloc Genesis (index = 0)');
	    if (latestBlockReceived.horodatage < latestBlockHeld.horodatage) {
		console.log('dans',here,'l\'horodatage du Bloc reçu (',latestBlockReceived.horodatage,') < à celui Bloc courant (',latestBlockHeld.horodatage,') le remplacer');
		B.replaceChain(receivedBlocks, here);
	    }
	} else {
	    console.log('dans',here,'La blockchain reçue est plus courte (',receivedBlocks.length,') que la blockchain actuelle (',latestBlockHeld.index+1,'). Ne rien faire.');
	}
    }
    console.log('\n');
    console.log('Blockchain:');
    console.log(A.blockChain);
    console.log('\n');
    console.log('Sortie  de',here);
    console.log('\n');
    console.log('===== Bloc #',latestBlockReceived.index,'fin de handleBlockchainResponse =====');
};

var initConnection = (ws, caller) => {
    var here = O.functionNameJS (ModuleName);
    console.log('\n');
    console.log('===== Entrée dans',here,'appelé par',caller,'=====');
    console.log('\n');
    console.log('===== Entrée dans',here,'nouvelle connexion à',ws.url,'=====');

    if (ws.url == undefined ) {
	console.log('\n');
	console.log('WARNING dans',here,'ws est undefined');
    }

    A.socket_a.push(ws);

    console.log('\n');
    console.log('dans',here,'ws pour ws.url',ws.url,'ajouté à A.socket_a');
    console.log('dans',here,'socket_a a',A.socket_a.length,'sockets');
    
    initMessageHandler(ws, here);
    console.log('\n');
    initErrorHandler(ws, here);
    console.log('\n');
    
    console.log('dans',here,'écriture de queryChainLengthMsg',queryChainLengthMsg(here),'dans ws.url',ws.url);
    
    B.write(ws, queryChainLengthMsg(here), here);
    
    console.log('      Sortie  de',here);
    console.log('\n');
};

var initErrorHandler = (ws, caller) => {
    var here = O.functionNameJS (ModuleName);
    console.log('\n');
    console.log('Entrée dans',here,'appelé par',caller);
    
    var closeConnection = (ws) => {
        console.log('dans',here,'échec de la connexion au pair ws.url', ws.url);
        A.socket_a.splice(A.socket_a.indexOf(ws), 1);
    };
    ws.on('close', () => closeConnection(ws));
    ws.on('error', () => closeConnection(ws));
    console.log('Sortie de ',here);
};

var initHttpServer = (http_port, app, caller) => {
    var here = O.functionNameJS(ModuleName);
    console.log('\n');
    console.log('===== Entrée dans',here,'appelé par',caller,'=====');

    app.use(bodyParser.json());

    app.get('/blocks', (req, res) => {
	console.log('\n');
	console.log('dans',here,'/blocks avec req.body',req.body);
	res.send(JSON.stringify(A.blockChain));
    });
    
    app.post('/mineBlock', (req, res) => {
	console.log('\n');
	console.log('dans',here,'/mineBlock avec req.body',req.body);
        var newBlock = B.generateNextBlock(req.body.contenu, here);
        B.addBlock(newBlock, here);
        B.broadcast(B.responseLatestMsg(here), here);
        console.log('dans',here,'après broadcast ajout et diffusion du bloc',JSON.stringify(newBlock));
        res.send();
    });
    
    app.get('/peers', (req, res) => {
	console.log('\n');
	console.log('dans',here,'/peers req.body',req.body);
        res.send(A.socket_a.map(s => s._socket.remoteAddress + ':' + s._socket.remotePort));
    });
    
    app.post('/addPeer', (req, res) => {
	console.log('\n');
	console.log('dans',here,'/addPeer req.body',req.body);
        connectToPeerUrls([req.body.peer], here);
        res.send();
    });
    
    app.listen(http_port, () => {
	console.log('\n');
	console.log('===== dans',here,'Écoute sur le port HTTP', http_port,'=====');}
	      );

    console.log('      Sortie  de',here);
};

var initMessageHandler = (ws, caller) => {
    var here = O.functionNameJS (ModuleName);

    console.log('\n');
    console.log('===== Entrée dans',here,'appelé par',caller,'=====');
    console.log('===== Entrée dans',here,'avec ws.url',ws.url,'=====');
    console.log('\n');
    console.log('dans',here,'il y a',A.socket_a.length,'sockets');
    console.log('\n');
    console.log('dans',here,'blockChain',A.blockChain);
    console.log('\n');
    
    if (A.socket_a.length < 1) {
	O.errorMessage ('socket_a.length > 0',A.socket_a.length, '?', here)
    }
    
    ws.on('message', (data) => {
        var message = JSON.parse(data);

	console.log('\n');
        console.log('dans',here,'ws.on Message Reçu data',data);
	console.log('dans',here,'message.type',message.type);
	console.log('\n');
	
        switch (message.type) {
        case B.MessageType.QUERY_LATEST:
	    console.log('dans',here,'write dans',ws.url,'de responseLatestMsg', B.responseLatestMsg(here));
            B.write(ws, B.responseLatestMsg(here), here);
            break;
        case B.MessageType.QUERY_ALL:
	    console.log('dans',here,'write dans',ws.url,'de responseChainMsg', responseChainMsg(here));
            B.write(ws, responseChainMsg(here), here);
            break;
        case B.MessageType.RESPONSE_BLOCKCHAIN:
	    console.log('dans',here,'appel de handleBlockchainResponse');
            handleBlockchainResponse (message, here)
            break;
        }
    });
    console.log('      Sortie de',here);
};

var initP2PServer = (p2p_port, caller) => {
    var here = O.functionNameJS (ModuleName);
    console.log('\n');
    console.log('===== Entrée dans',here,'appelé par',caller,'=====',);
    console.log('===== Entrée dans',here,'avec p2p_port',p2p_port,'=====',);
    console.log('\n');
    
    var server = new WebSocket.Server({port: p2p_port});
    server.on('connection', ws =>
		  initConnection(ws, here)
	     );
    console.log('============ dans',here,'création du WebSocket.Server en Écoute du port P2P sur',p2p_port,'=====');
    console.log('      Sortie  de ',here);
};

var printWebSocketOn = (ws, caller) => {
    
    ws.on('message', (data) => {
	console.log('appelé par',caller,'ws.on data',data);
    });
    ws.on('connection', (ws) => {
	console.log('appelé par',caller,'ws.on connection',ws.url);
    });
    
}

var queryChainLengthMsg = (caller) => {
    var here = O.functionNameJS (ModuleName);
    console.log('\n');
    console.log('Entrée dans',here,'appelé par',caller);
    
    var result = ({'type': B.MessageType.QUERY_LATEST});
    return result;
};

var queryAllMsg = (caller) => {
    var here = O.functionNameJS (ModuleName);
    console.log('\n');
    console.log('Entrée dans',here,'appelé par',caller);
    
    var result = ({'type': B.MessageType.QUERY_ALL});
    return result;
};

var responseChainMsg = (caller) => {
    var here = O.functionNameJS (ModuleName);
    console.log('\n');
    console.log('Entrée dans',here,'appelé par',caller,'avec',A.blockChain.length,'blocs');
    
    var result = {
	'type': B.MessageType.RESPONSE_BLOCKCHAIN,
	'data': JSON.stringify(A.blockChain)
    }

    console.log('Sortie  de',here,'result',result);
    return result;
};

module.exports.connectToPeerUrl = connectToPeerUrl;
module.exports.connectToPeerUrls = connectToPeerUrls;
module.exports.initHttpServer = initHttpServer;
module.exports.initP2PServer = initP2PServer;
