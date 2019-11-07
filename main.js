'use strict';

var express = require("express");
var WebSocket = require("ws");

var WS = require ('./websocket.js');
var B = require ('./blockchain.js');
var A = require("./arrays");
var O = require("./outils");

var ModuleName = 'main';
var here = 'main';

var http_port = process.env.HTTP_PORT || 3001;
var p2p_port = process.env.P2P_PORT || 6001;
var InitialPeers = process.env.PEERS ? process.env.PEERS.split(',') : [];

var app = express();

console.log ('\nDans',here,'InitialPeers',InitialPeers);
const {Block} = require ('./block.js');

A.blockChain = [B.getGenesisBlock()];

A.socket_a = [];

WS.connectToPeers(InitialPeers, 'main');
WS.initHttpServer(http_port, app, 'main');
WS.initP2PServer(p2p_port, 'main');
console.log('\n===== Fin de main =====\n');

