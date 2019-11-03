'use strict';

var express = require("express");
var WebSocket = require("ws");

var WS = require ('./websocket.js');
var B = require ('./blockchain.js');
var O = require("./outils");

var ModuleName = 'main';
var here = 'main';

var http_port = process.env.HTTP_PORT || 3001;
var p2p_port = process.env.P2P_PORT || 6001;
var InitialPeers = process.env.PEERS ? process.env.PEERS.split(',') : [];

var app = express();

console.log ('\nDans',here,'InitialPeers',InitialPeers);
const {Block} = require ('./block.js');

var getGenesisBlock = () => {
    return new Block(0, "0", 1465154705, "mon bloc genesis !", "816534932c2b7154836da6afc367695e6337db8a921823784c14378abed4f7d7");
};

var BlockChain = [getGenesisBlock()];

var Sockets = [];

WS.connectToPeers(InitialPeers, Sockets, BlockChain, 'main');
WS.initHttpServer(http_port, Sockets, BlockChain, app, 'main');
WS.initP2PServer(p2p_port, Sockets, BlockChain, 'main');
console.log('\n ######## Fin ############# \n');

