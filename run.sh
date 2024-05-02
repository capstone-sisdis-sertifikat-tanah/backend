cd network

./network.sh up -ca -s couchdb

sleep 5

./network.sh createChannel

sleep 5

./network.sh deployCC -ccn atcontract -ccp ../chaincode/atcontract -ccl go
./network.sh deployCC -ccn usercontract -ccp ../chaincode/usercontract -ccl go
<<<<<<< Updated upstream
./network.sh deployCC -ccn dokcontract -ccp ../chaincode/dokcontract -ccl go
./network.sh deployCC -ccn certcontract -ccp ../chaincode/certcontract -ccl go
./network.sh deployCC -ccn aktacontract -ccp ../chaincode/aktacontract -ccl go
=======
./network.sh deployCC -ccn certcontract -ccp ../chaincode/certcontract -ccl go
./network.sh deployCC -ccn aktacontract -ccp ../chaincode/aktacontract -ccl go
./network.sh deployCC -ccn dokcontract -ccp ../chaincode/dokcontract -ccl go
>>>>>>> Stashed changes
