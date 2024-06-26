#!/bin/bash
#
# Copyright IBM Corp All Rights Reserved
#
# SPDX-License-Identifier: Apache-2.0
#

# This is a collection of bash functions used by different scripts

# imports
. scripts/utils.sh

export CORE_PEER_TLS_ENABLED=true
export ORDERER_CA=${PWD}/organizations/ordererOrganizations/example.com/tlsca/tlsca.example.com-cert.pem
export PEER0_BADANPERTANAHANNASIONAL_CA=${PWD}/organizations/peerOrganizations/badanpertanahannasional.example.com/tlsca/tlsca.badanpertanahannasional.example.com-cert.pem
export PEER0_USER_CA=${PWD}/organizations/peerOrganizations/user.example.com/tlsca/tlsca.user.example.com-cert.pem
export PEER0_ORG3_CA=${PWD}/organizations/peerOrganizations/org3.example.com/tlsca/tlsca.org3.example.com-cert.pem

# Set environment variables for the peer org
setGlobals() {
  local USING_ORG=""
  if [ -z "$OVERRIDE_ORG" ]; then
    USING_ORG=$1
  else
    USING_ORG="${OVERRIDE_ORG}"
  fi
  infoln "Using organization ${USING_ORG}"
  if [ $USING_ORG = 'badanpertanahannasional' ]; then
    export CORE_PEER_LOCALMSPID="BadanPertanahanNasionalMSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=$PEER0_BADANPERTANAHANNASIONAL_CA
    export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/badanpertanahannasional.example.com/users/Admin@badanpertanahannasional.example.com/msp
    export CORE_PEER_ADDRESS=localhost:7051
  elif [ $USING_ORG = 'user' ]; then
    export CORE_PEER_LOCALMSPID="UserMSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=$PEER0_USER_CA
    export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/user.example.com/users/Admin@user.example.com/msp
    export CORE_PEER_ADDRESS=localhost:9051
  elif [ $USING_ORG -eq 3 ]; then
    export CORE_PEER_LOCALMSPID="Org3MSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=$PEER0_ORG3_CA
    export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org3.example.com/users/Admin@org3.example.com/msp
    export CORE_PEER_ADDRESS=localhost:11051
  else
    echo $USING_ORG
    errorln "ORG Unknown"
  fi

  if [ "$VERBOSE" == "true" ]; then
    env | grep CORE
  fi
}

# Set environment variables for use in the CLI container
setGlobalsCLI() {
  setGlobals $1

  local USING_ORG=""
  if [ -z "$OVERRIDE_ORG" ]; then
    USING_ORG=$1
  else
    USING_ORG="${OVERRIDE_ORG}"
  fi
  if [ $USING_ORG = 'badanpertanahannasional' ]; then
    export CORE_PEER_ADDRESS=peer0.badanpertanahannasional.example.com:7051
  elif [ $USING_ORG = 'user' ]; then
    export CORE_PEER_ADDRESS=peer0.user.example.com:9051
  elif [ $USING_ORG -eq 3 ]; then
    export CORE_PEER_ADDRESS=peer0.org3.example.com:11051
  else
    errorln "ORG Unknown"
  fi
}

# parsePeerConnectionParameters $@
# Helper function that sets the peer connection parameters for a chaincode
# operation
parsePeerConnectionParameters() {
  PEER_CONN_PARMS=()
  PEERS=""
  while [ "$#" -gt 0 ]; do
    setGlobals $1
    PEER="peer0.$1"
    ## Set peer addresses
    if [ -z "$PEERS" ]
    then
	PEERS="$PEER"
    else
	PEERS="$PEERS $PEER"
    fi
    PEER_CONN_PARMS=("${PEER_CONN_PARMS[@]}" --peerAddresses $CORE_PEER_ADDRESS)
    ## Set path to TLS certificate
    # CA="organizations/peerOrganizations/$1.example.com/peers/peer0.$1.example.com/tls/ca.crt"
    ORG_CAPITAL=${1^^}
    CA=PEER0_${ORG_CAPITAL}_CA
    TLSINFO=(--tlsRootCertFiles "${!CA}")
    PEER_CONN_PARMS=("${PEER_CONN_PARMS[@]}" "${TLSINFO[@]}")
    # shift by one to get to the next organization
    shift
  done
}

verifyResult() {
  if [ $1 -ne 0 ]; then
    fatalln "$2"
  fi
}
