#!/bin/bash

args=$*
argnumber=$#

script=`basename $0`
last=3

if [ $# -ne $last ] 
then
    echo -e "Usage :\n$script <http_port> <p2p_port> <p2p_port_peer>\n"
    exit 1
fi

HTTP_PORT=$1 P2P_PORT=$2 PEERS=ws://localhost:$3 npm start
