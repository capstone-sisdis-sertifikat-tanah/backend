const iResp = require('../utils/response.interface.js')
const fabric = require('../utils/fabric.js')
const { BlockDecoder } = require('fabric-common')

const create = async (user, args) => {
  try {
    const network = await fabric.connectToNetwork(
      user.organizationName,
      'certcontract',
      user.username
    )
    await network.contract.submitTransaction('CreateCERT', JSON.stringify(args))
    network.gateway.disconnect()
    return iResp.buildSuccessResponseWithoutData(
      200,
      'Successfully registered a new carbon transaction'
    )
  } catch (error) {
    return iResp.buildErrorResponse(500, 'Something wrong', error.message)
  }
}

const getById = async (user, args) => {
  try {
    const network = await fabric.connectToNetwork(
      user.organizationName,
      'certcontract',
      user.username
    )
    const result = await network.contract.submitTransaction('GetCertById', args)
    network.gateway.disconnect()
    return iResp.buildSuccessResponse(
      200,
      `Successfully get Certificate ${result.id}`,
      JSON.parse(result)
    )
  } catch (error) {
    return iResp.buildErrorResponse(500, 'Something wrong', error.message)
  }
}

const getCertificateByIdPemilik = async (user, data) => {
  try {
    const idPemilik = data
    const network = await fabric.connectToNetwork(
      user.organizationName,
      'certcontract',
      user.username
    )

    const result = await network.contract.submitTransaction(
      'GetAllAktaByPemilik',
      idPemilik
    )
    network.gateway.disconnect()
    return iResp.buildSuccessResponse(
      200,
      `Successfully get carbon transaction ${idPemilik}`,
      JSON.parse(result)
    )
  } catch (error) {
    return iResp.buildErrorResponse(500, 'Something wrong', error.message)
  }
}
const getSertifikatHistory = async (user, data) => {
  try {
    const idSertifikat = data
    const network = await fabric.connectToNetwork(
      user.organizationName,
      'certcontract',
      user.username
    )
    const result = await network.contract.submitTransaction(
      'GetSertifikatHistory',
      idSertifikat
    )
    network.gateway.disconnect()
    return iResp.buildSuccessResponse(
      200,
      `Successfully get sertifikat history`,
      JSON.parse(result)
    )
  } catch (error) {
    return iResp.buildErrorResponse(500, 'Something wrong', error.message)
  }
}

const generateIdentifier = async (user, idCertificate) => {
  try {
    var network = await fabric.connectToNetwork(
      user.organizationName,
      'certcontract',
      user.username
    )
    const sertifikat = JSON.parse(
      await network.contract.evaluateTransaction('GetCertById', idCertificate)
    )
    console.log(sertifikat)
    network.gateway.disconnect()

    const identifier = {}
    network = await fabric.connectToNetwork(
      'badanpertanahannasional',
      'qscc',
      'admin'
    )
    const blockSertifikat = await network.contract.evaluateTransaction(
      'GetBlockByTxID',
      'bpnchannel',
      sertifikat.TxId[sertifikat.TxId.length - 1]
    )

    identifier.sertifikat = fabric.calculateBlockHash(
      BlockDecoder.decode(blockSertifikat).header
    )
    network.gateway.disconnect()
    return iResp.buildSuccessResponse(
      200,
      'Successfully get Identifier',
      identifier
    )
  } catch (error) {
    return iResp.buildErrorResponse(500, 'something wrong', error.message)
  }
}

const verify = async (user, identifier) => {
  try {
    // find block that block hash == identifier
    const network = await fabric.connectToNetwork(
      'badanpertanahannasional',
      'qscc',
      'admin'
    )
    const blockSertifikat = await network.contract.evaluateTransaction(
      'GetBlockByHash',
      'bpnchannel',
      Buffer.from(identifier.sertifikat, 'hex')
    )

    // Get data from block

    const argsSert =
      BlockDecoder.decode(blockSertifikat).data.data[2].payload.data.actions[0]
        .payload.chaincode_proposal_payload.input.chaincode_spec.input.args

    const idSertifikat = Buffer.from(argsSert[1]).toString()

    console.log('ID Sertifikat: ', idSertifikat)
    //query data ijazah, transkrip, nilai
    network.gateway.disconnect()

    const certNetwork = await fabric.connectToNetwork(
      user.organizationName,
      'certcontract',
      user.username
    )
    const cert = await certNetwork.contract.evaluateTransaction(
      'GetCertById',
      idSertifikat
    )
    certNetwork.gateway.disconnect()
    const parseData = JSON.parse(cert)

    parseData.signatures = await fabric.getAllSignature(parseData.TxId)
    console.log(parseData)
    const data = {
      sertifikat: parseData,
    }

    const result = {
      success: true,
      message: 'Sertifikat asli',
      data: data,
    }
    return iResp.buildSuccessResponse(
      200,
      'Successfully get Sertifikat',
      result
    )
  } catch (error) {
    console.log('ERROR', error)
    const result = {
      success: true,
      message: 'Sertifikat palsu',
    }
    return iResp.buildErrorResponse(500, 'Something wrong', result)
  }
}

const update = async (user, args) => {
  try {
    const network = await fabric.connectToNetwork(
      user.organizationName,
      'certcontract',
      user.username
    )
    await network.contract.submitTransaction(
      'UpdateSertifikat',
      JSON.stringify(args)
    )
    network.gateway.disconnect()
    return iResp.buildSuccessResponseWithoutData(
      200,
      'Successfully update Sertifikat'
    )
  } catch (error) {
    return iResp.buildErrorResponse(500, 'Something wrong', error.message)
  }
}

module.exports = {
  getCertificateByIdPemilik,
  getById,
  create,
  generateIdentifier,
  getSertifikatHistory,
  verify,
  update,
}
