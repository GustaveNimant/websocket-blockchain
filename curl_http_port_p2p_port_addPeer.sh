#!/bin/bash

args=$*
argnumber=$#

script=`basename $0`
httpPort=$1
shift;p2pPort=$1
last=2

if [ ${argnumber} -ne $last ] 
then
    echo -e "Usage :\n$script <httpPort> <p2pPort>\n"
    echo -e "Exemple :\n$script 3001 6001\n"
    exit 1
fi

curl -H "Content-type:application/json" --data '{"peer" : "ws://localhost:'${p2pPort}'"}' http://localhost:${httpPort}/addPeer
