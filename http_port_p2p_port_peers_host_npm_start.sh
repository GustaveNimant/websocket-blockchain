#!/bin/bash

args=$*
argnumber=$#

script=`basename $0`
last=4

if [ $# -ne $last ] 
then
    echo -e "Usage :\n$script <http_port> <p2p_port> <p2p_port_peer> <host_peer>\n"
    echo -e "Exemple :\n$script 3001 6001 6002 localhost\n"
    echo -e "Exemple :\nHTTP_PORT=3003 P2P_PORT=6003 PEERS=ws://localhost:6001,ws://localhost:6002 npm start\n"
     echo -e "Exemple :\nHTTP_PORT=3001 P2P_PORT=6001 PEERS=ws://92.147.224.225:6001 npm start\n"
    exit 1
fi

HTTP_PORT=$1 P2P_PORT=$2 PEERS=ws://$4:$3 npm start
