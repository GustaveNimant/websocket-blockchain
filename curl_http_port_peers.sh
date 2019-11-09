#!/bin/bash

args=$*
argnumber=$#

script=`basename $0`
httpPort=$1
last=1

if [ ${argnumber} -ne $last ] 
then
    echo -e "Usage :\n$script <httpPort>\n"
    echo -e "Exemple :\n$script 3001\n"
    exit 1
fi

curl http://localhost:${httpPort}/peers
