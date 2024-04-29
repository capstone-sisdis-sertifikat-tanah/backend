#!/bin/bash
#
# SPDX-License-Identifier: Apache-2.0




# default to using BadanPertahananNasional
ORG=${1:-BADANPERTAHANANNASIONAL}

# Exit on first error, print all commands.
set -e
set -o pipefail

# Where am I?
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." && pwd )"

ORDERER_CA=${DIR}/network/organizations/ordererOrganizations/example.com/tlsca/tlsca.example.com-cert.pem
PEER0_BADANPERTAHANANNASIONAL_CA=${DIR}/network/organizations/peerOrganizations/badanpertahanannasional.example.com/tlsca/tlsca.badanpertahanannasional.example.com-cert.pem
PEER0_USER_CA=${DIR}/network/organizations/peerOrganizations/user.example.com/tlsca/tlsca.user.example.com-cert.pem
PEER0_ORG3_CA=${DIR}/network/organizations/peerOrganizations/org3.example.com/tlsca/tlsca.org3.example.com-cert.pem


if [[ ${ORG,,} == "badanpertahanannasional" || ${ORG,,} == "digibank" ]]; then

   CORE_PEER_LOCALMSPID=BadanPertahananNasionalMSP
   CORE_PEER_MSPCONFIGPATH=${DIR}/network/organizations/peerOrganizations/badanpertahanannasional.example.com/users/Admin@badanpertahanannasional.example.com/msp
   CORE_PEER_ADDRESS=localhost:7051
   CORE_PEER_TLS_ROOTCERT_FILE=${DIR}/network/organizations/peerOrganizations/badanpertahanannasional.example.com/tlsca/tlsca.badanpertahanannasional.example.com-cert.pem

elif [[ ${ORG,,} == "user" || ${ORG,,} == "magnetocorp" ]]; then

   CORE_PEER_LOCALMSPID=UserMSP
   CORE_PEER_MSPCONFIGPATH=${DIR}/network/organizations/peerOrganizations/user.example.com/users/Admin@user.example.com/msp
   CORE_PEER_ADDRESS=localhost:9051
   CORE_PEER_TLS_ROOTCERT_FILE=${DIR}/network/organizations/peerOrganizations/user.example.com/tlsca/tlsca.user.example.com-cert.pem

else
   echo "Unknown \"$ORG\", please choose BadanPertahananNasional/Digibank or User/Magnetocorp"
   echo "For example to get the environment variables to set upa User shell environment run:  ./setOrgEnv.sh User"
   echo
   echo "This can be automated to set them as well with:"
   echo
   echo 'export $(./setOrgEnv.sh User | xargs)'
   exit 1
fi

# output the variables that need to be set
echo "CORE_PEER_TLS_ENABLED=true"
echo "ORDERER_CA=${ORDERER_CA}"
echo "PEER0_BADANPERTAHANANNASIONAL_CA=${PEER0_BADANPERTAHANANNASIONAL_CA}"
echo "PEER0_USER_CA=${PEER0_USER_CA}"
echo "PEER0_ORG3_CA=${PEER0_ORG3_CA}"

echo "CORE_PEER_MSPCONFIGPATH=${CORE_PEER_MSPCONFIGPATH}"
echo "CORE_PEER_ADDRESS=${CORE_PEER_ADDRESS}"
echo "CORE_PEER_TLS_ROOTCERT_FILE=${CORE_PEER_TLS_ROOTCERT_FILE}"

echo "CORE_PEER_LOCALMSPID=${CORE_PEER_LOCALMSPID}"
