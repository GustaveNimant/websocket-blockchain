#!/bin/bash

args=$*
argnumber=$#

script=`basename $0`
port=$1
last=1

if [ $# -ne $last ] 
then
    echo -e "Usage :\n$script <port>\n"
    exit 1
fi

curl -H "Content-type:application/json" --data '{"contenu" : "Données du premier block de websocket-blockchain"}' http://localhost:${port}/mineBlock
