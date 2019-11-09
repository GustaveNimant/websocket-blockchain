'use strict';

var WebSocket = require("ws");
var bodyParser = require('body-parser');

var A = require("./arrays");
var O = require("./outils");
var B = require ('./blockchain.js');

const {Block} = require ('./block.js');

var ModuleName = 'websocket.js';

var connectToPeers = (newPeers, caller) => {
    var here = O.functionNameJS(ModuleName); 
    console.log('Entrée dans',here,'appelé par',caller,'avec',newPeers.length,'newPeers');

    newPeers.forEach((peerUrl) => {
	console.log('Dans',here,'boucle sur peerUrl',peerUrl);
        var ws = new WebSocket(peerUrl);
	
	console.log('Dans',here,'création de ws.url',ws.url)
	console.log('Dans',here,'ws.readyState',ws.readyState)
        ws.on('open', () => initConnection(ws, here));
        ws.on('error', () => {
            console.log('Dans',here,'échec de la connexion à ws',ws.url)
        });
    });
    console.log('Sortie  de ',here);
};

var generateNextBlock = (blockData, caller) => {
    var here = O.functionNameJS(ModuleName);
    console.log('Entrée dans',here,'appelé par',caller,'avec blockData',blockData);

    var previousBlock = B.getLatestBlock();
    var nextIndex = previousBlock.index + 1;
    var nextTimestamp = new Date().getTime() / 1000;
    var nextHash = O.calculateHash(nextIndex, previousBlock.hashCourant, nextTimestamp, blockData);

    var result = new Block(nextIndex,
			   "texte",
			   blockData,
			   nextTimestamp,
			   "clé publique",
			   previousBlock.hashCourant,
			   nextHash); 
    console.log('Sortie  de',here,'avec result',result);

    return result; 
};

var handleBlockchainResponse = (message, caller) => {
    var here = O.functionNameJS(ModuleName);
    console.log('\n');
    console.log('Entrée dans',here,'appelé par',caller);
    console.log('Entrée dans',here,'avec message',message);
    
    /* tri sur les indices */
    var receivedBlocks = JSON.parse(message.data).sort((b1, b2) => (b1.index - b2.index));
    var latestBlockReceived = receivedBlocks[receivedBlocks.length - 1];
    var latestBlockHeld = A.blockChain[A.blockChain.length - 1];

    console.log('\n');
    console.log('Dans',here,'Tous les Blocs reçus:',receivedBlocks);
        console.log('\n');
    console.log('Dans',here,'Dernier  Bloc stocké:',latestBlockHeld);
    console.log('\n');
    console.log('Dans',here,'Index du dernier block:',latestBlockHeld.index);
    console.log('Dans',here,'Index du block    reçu:',latestBlockReceived.index);
    console.log('\n');
    
    
    if (latestBlockReceived.index > latestBlockHeld.index) {
        console.log('dans',here,'index du dernier Bloc de la blockchain :',latestBlockHeld.index);
	console.log('dans',here,'index du bloc reçu par le pair :',latestBlockReceived.index);
	
        if (latestBlockHeld.hashCourant === latestBlockReceived.hashPrecedent) {
            console.log('Dans',here,'Les Hashes correspondent. Nous pouvons appondre le bloc reçu à notre chaîne et le diffuser');
            A.blockChain.push (latestBlockReceived);
            B.broadcast (B.responseLatestMsg(), here);
        } else if (receivedBlocks.length === 1) {
            console.log('Dans',here,'Le block reçu a une longueur de 1. Nous devons interroger notre chaîne depuis notre pair');
            B.broadcast(queryAllMsg(), here);
        } else {
            console.log('Dans',here,'La blockchain reçue est plus longue (',receivedBlocks.length,') que la blockchain actuelle (',latestBlockHeld.index,') la remplacer');
            B.replaceChain(receivedBlocks, here);
        }
    } else {
	if (latestBlockReceived.index == 0) {
            console.log('Dans',here,'La blockchain a reçu un Bloc Genesis (index = 0)');
	    if (latestBlockReceived.horodatage < latestBlockHeld.horodatage) {
		console.log('Dans',here,'l\'horodatage du Bloc reçu (',latestBlockReceived.horodatage,') < à celui Bloc courant (',latestBlockHeld.horodatage,') le remplacer');
		B.replaceChain(receivedBlocks, here);
	    }
	} else {
	    console.log('Dans',here,'La blockchain reçue est plus courte (',receivedBlocks.length,') que la blockchain actuelle (',latestBlockHeld.index+1,'). Ne rien faire.');
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

    if (ws == undefined ) {
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
    
    console.log('dans',here,'écriture de queryChainLengthMsg',queryChainLengthMsg(),'dans ws.url',ws.url);
    
    B.write(ws, queryChainLengthMsg(), here);
    console.log('      Sortie  de',here);
};

var initErrorHandler = (ws, caller) => {
    var here = O.functionNameJS (ModuleName);
    console.log('\n');
    console.log('Entrée dans',here,'appelé par',caller);

    var closeConnection = (ws) => {
        console.log('Dans',here,'échec de la connexion au pair ws.url', ws.url);
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
	console.log('     dans',here,'/blocks avec req.body',req.body);
	    res.send(JSON.stringify(A.blockChain));
	   });
    
    app.post('/mineBlock', (req, res) => {
	console.log('     dans',here,'/mineBlock avec req.body',req.body);
        var newBlock = generateNextBlock(req.body.contenu, here);
        B.addBlock(newBlock, here);
        B.broadcast(B.responseLatestMsg(), here);
        console.log('Dans',here,'ajout et diffusion du bloc',JSON.stringify(newBlock));
        res.send();
    });
    app.get('/peers', (req, res) => {
	console.log('Dans',here,'/peers req.body',req.body);
        res.send(A.socket_a.map(s => s._socket.remoteAddress + ':' + s._socket.remotePort));
    });
    app.post('/addPeer', (req, res) => {
	console.log('Dans',here,'/addPeer req.body',req.body);
        connectToPeers([req.body.peer], here);
        res.send();
    });
    
    app.listen(http_port, () => {
	console.log('\n');
	console.log('===== Dans',here,'Écoute sur le port HTTP', http_port,'=====');}
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

        console.log('Dans',here,'ws.on Message Reçu data',data);
	console.log('Dans',here,'message.type',message.type);
	console.log('\n');
	
        switch (message.type) {
        case B.MessageType.QUERY_LATEST:
	    console.log('Dans',here,'write dans',ws.url,'de responseLatestMsg', B.responseLatestMsg());
            B.write(ws, B.responseLatestMsg(), here);
            break;
        case B.MessageType.QUERY_ALL:
	    console.log('Dans',here,'appel de responseChainMsg');
            B.write(ws, B.responseChainMsg(), here);
            break;
        case B.MessageType.RESPONSE_BLOCKCHAIN:
	    console.log('Dans',here,'appel de handleBlockchainResponse');
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

var queryChainLengthMsg = () => ({'type': B.MessageType.QUERY_LATEST});

var queryAllMsg = () => ({'type': B.MessageType.QUERY_ALL});

var responseChainMsg = () => {
    var here = O.functionNameJS (ModuleName);
    console.log('\n');
    console.log('Entrée dans',here,'avec',A.blockChain.length,'blocs');
    
    var result = {
	'type': B.MessageType.RESPONSE_BLOCKCHAIN,
	'data': JSON.stringify(A.blockChain)
    }

    console.log('Sortie  de',here,'result',result);
    return result;
};

var printWebSocketOn = (ws, caller) => {
    
    ws.on('message', (data) => {
	console.log('appelé par',caller,'ws.on data',data);
    });
    ws.on('connection', (ws) => {
	console.log('appelé par',caller,'ws.on connection',ws.url);
    });
    
}

module.exports.connectToPeers = connectToPeers;
module.exports.initHttpServer = initHttpServer;
module.exports.initP2PServer = initP2PServer;

