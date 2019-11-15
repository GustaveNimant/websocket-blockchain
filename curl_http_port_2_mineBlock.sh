#!/bin/bash

args=$*
argnumber=$#

script=`basename $0`
httpPort=$1
last=1

if [ $# -ne $last ] 
then
    echo -e "Usage :\n$script <httpPort>\n"
    echo -e "Exemple :\n$script 3001\n"
    exit 1
fi

curl -H "Content-type:application/json" --data '{"contenu" : "Donnees du deuxième block de websocket-blockchain"}' http://localhost:${httpPort}/mineBlock
