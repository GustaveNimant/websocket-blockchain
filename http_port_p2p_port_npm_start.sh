#!/bin/bash

args=$*
argnumber=$#

script=`basename $0`
last=2

if [ $# -ne $last ] 
then
    echo -e "Usage :\n$script <http_port> <p2p_port>\n"
    echo -e "Exemple :\n$script 3001 6001\n"
    exit 1
fi

HTTP_PORT=$1 P2P_PORT=$2 npm start
