#!/bin/bash

function one_line_pem {
    echo "`awk 'NF {sub(/\\n/, ""); printf "%s\\\\\\\n",$0;}' $1`"
}

function json_ccp {
    local PP=$(one_line_pem $5)
    local CP=$(one_line_pem $6)
    sed -e "s/\${ORG}/$1/" \
        -e "s/\${ORGCAP}/$2/" \
        -e "s/\${P0PORT}/$3/" \
        -e "s/\${CAPORT}/$4/" \
        -e "s#\${PEERPEM}#$PP#" \
        -e "s#\${CAPEM}#$CP#" \
        organizations/ccp-template.json
}

function yaml_ccp {
    local PP=$(one_line_pem $5)
    local CP=$(one_line_pem $6)
    sed -e "s/\${ORG}/$1/" \
        -e "s/\${ORGCAP}/$2/" \
        -e "s/\${P0PORT}/$3/" \
        -e "s/\${CAPORT}/$4/" \
        -e "s#\${PEERPEM}#$PP#" \
        -e "s#\${CAPEM}#$CP#" \
        organizations/ccp-template.yaml | sed -e $'s/\\\\n/\\\n          /g'
}

ORG=badanpertahanannasional
ORGCAP=BadanPertahananNasional
P0PORT=7051
CAPORT=7054
PEERPEM=organizations/peerOrganizations/badanpertahanannasional.example.com/tlsca/tlsca.badanpertahanannasional.example.com-cert.pem
CAPEM=organizations/peerOrganizations/badanpertahanannasional.example.com/ca/ca.badanpertahanannasional.example.com-cert.pem

echo "$(json_ccp $ORG $ORGCAP $P0PORT $CAPORT $PEERPEM $CAPEM)" > organizations/peerOrganizations/badanpertahanannasional.example.com/connection-badanpertahanannasional.json
echo "$(yaml_ccp $ORG $ORGCAP $P0PORT $CAPORT $PEERPEM $CAPEM)" > organizations/peerOrganizations/badanpertahanannasional.example.com/connection-badanpertahanannasional.yaml

ORG=user
ORGCAP=User
P0PORT=9051
CAPORT=8054
PEERPEM=organizations/peerOrganizations/user.example.com/tlsca/tlsca.user.example.com-cert.pem
CAPEM=organizations/peerOrganizations/user.example.com/ca/ca.user.example.com-cert.pem

echo "$(json_ccp $ORG $ORGCAP $P0PORT $CAPORT $PEERPEM $CAPEM)" > organizations/peerOrganizations/user.example.com/connection-user.json
echo "$(yaml_ccp $ORG $ORGCAP $P0PORT $CAPORT $PEERPEM $CAPEM)" > organizations/peerOrganizations/user.example.com/connection-user.yaml