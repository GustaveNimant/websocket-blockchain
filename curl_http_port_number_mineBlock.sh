#!/bin/bash

args=$*
argnumber=$#

script=`basename $0`
httpPort=$1
shift;texte=$1
last=2

if [ $argnumber -ne $last ] 
then
    echo -e "Usage :\n$script <httpPort>\n"
    echo -e "Exemple :\n$script 3001 troisième\n"
    exit 1
fi

curl -H "Content-type:application/json" --data '{"contenu" : "Données du '$texte' block de websocket-blockchain"}' http://localhost:${httpPort}/mineBlock
