const iResp = require('../utils/response.interface.js')
const fabric = require('../utils/fabric.js')
const { BlockDecoder } = require('fabric-common')
const { bufferToJson } = require('../../utils/converter.js')
const { v4: uuidv4 } = require('uuid')

const create = async (user, args) => {
  try {
    const network = await fabric.connectToNetwork(
      user.organizationName,
      'dokcontract',
      user.username
    )
    await network.contract.submitTransaction('CreateDOK', JSON.stringify(args))
    network.gateway.disconnect()
    return iResp.buildSuccessResponseWithoutData(
      200,
      'Successfully registered a new Dokumen'
    )
  } catch (error) {
    return iResp.buildErrorResponse(500, 'Something wrong', error.message)
  }
}

const getById = async (user, args) => {
  try {
    const network = await fabric.connectToNetwork(
      user.organizationName,
      'dokcontract',
      user.username
    )
    const result = await network.contract.submitTransaction('GetDokById', args)
    network.gateway.disconnect()
    return iResp.buildSuccessResponse(
      200,
      `Successfully get Akta ${result.id}`,
      JSON.parse(result)
    )
  } catch (error) {
    return iResp.buildErrorResponse(500, 'Something wrong', error.message)
  }
}

const getDokumenByIdPembeli = async (user, data) => {
  try {
    const idPembeli = data
    const network = await fabric.connectToNetwork(
      user.organizationName,
      'dokcontract',
      user.username
    )

    const result = await network.contract.submitTransaction(
      'GetAllDokumenByPembeli',
      idPembeli
    )
    network.gateway.disconnect()
    return iResp.buildSuccessResponse(
      200,
      `Successfully get Dokumen by id pembeli: ${idPembeli}`,
      JSON.parse(result)
    )
  } catch (error) {
    return iResp.buildErrorResponse(500, 'Something wrong', error.message)
  }
}
const getDokumenByIdPenjual = async (user, data) => {
  try {
    const idPenjual = data
    const network = await fabric.connectToNetwork(
      user.organizationName,
      'dokcontract',
      user.username
    )

    const result = await network.contract.submitTransaction(
      'GetAllDokumenByPenjual',
      idPenjual
    )
    network.gateway.disconnect()
    return iResp.buildSuccessResponse(
      200,
      `Successfully get Dokumen by id Penjual: ${idPenjual}`,
      JSON.parse(result)
    )
  } catch (error) {
    return iResp.buildErrorResponse(500, 'Something wrong', error.message)
  }
}
const getDokumenByStatus = async (user, data) => {
  try {
    const status = data
    const network = await fabric.connectToNetwork(
      user.organizationName,
      'dokcontract',
      user.username
    )

    const result = await network.contract.submitTransaction(
      'GetAllDokumenByStatus',
      status
    )
    network.gateway.disconnect()
    return iResp.buildSuccessResponse(
      200,
      `Successfully get Dokumen by Status: ${status}`,
      JSON.parse(result)
    )
  } catch (error) {
    return iResp.buildErrorResponse(500, 'Something wrong', error.message)
  }
}

const generateIdentifier = async (user, idDokumen) => {
  try {
    var network = await fabric.connectToNetwork(
      user.organizationName,
      'dokcontract',
      user.username
    )
    const dokumen = JSON.parse(
      await network.contract.evaluateTransaction('GetDokById', idDokumen)
    )

    network.gateway.disconnect()

    const identifier = {}
    network = await fabric.connectToNetwork('Kementrian', 'qscc', 'admin')

    const blockDokumen = await network.contract.evaluateTransaction(
      'GetBlockByTxID',
      'bpnchannel',
      dokumen.txId[dokumen.txId.length - 1]
    )

    identifier.dokumen = fabric.calculateBlockHash(
      BlockDecoder.decode(blockDokumen).header
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
    const network = await fabric.connectToNetwork('Kementrian', 'qscc', 'admin')
    const blockDokumen = await network.contract.evaluateTransaction(
      'GetBlockByHash',
      'bpnchannel',
      Buffer.from(identifier.dokumen, 'hex')
    )

    // Get data from block
    const argsDokumen =
      BlockDecoder.decode(blockDokumen).data.data[0].payload.data.actions[0]
        .payload.chaincode_proposal_payload.input.chaincode_spec.input.args
    const idDokumen = Buffer.from(argsDokumen[1]).toString()

    console.log('ID Dokumen: ', idDokumen)
    //query data ijazah, transkrip, nilai
    network.gateway.disconnect()

    const dokumenNetwork = await fabric.connectToNetwork(
      user.organizationName,
      'dokcontract',
      user.username
    )
    const dokumen = await aktaNetwork.contract.evaluateTransaction(
      'GetDokById',
      idDokumen
    )
    dokumenNetwork.gateway.disconnect()
    const parseData = JSON.parse(dokumen)

    parseData.signatures = await fabric.getAllSignature(parseData.txId)
    console.log(parseData)
    const data = {
      dokumen: parseData,
    }

    const result = {
      success: true,
      message: 'Dokumen asli',
      data: data,
    }
    return iResp.buildSuccessResponse(200, 'Successfully get Dokumen', result)
  } catch (error) {
    console.log('ERROR', error)
    const result = {
      success: true,
      message: 'Dokumen palsu',
    }
    return iResp.buildErrorResponse(500, 'Something wrong', result)
  }
}

const approve = async (user, args) => {
  try {
    const network = await fabric.connectToNetwork(
      user.organizationName,
      'dokcontract',
      user.username
    )
    const result = JSON.parse(
      await network.contract.submitTransaction('GetDokById', args.id)
    )
    network.gateway.disconnect()
    if (
      (result.status = 'Menunggu Persetujuan Bank' && user.userType === 'bank')
    ) {
      if (args.status === 'approve') {
        result.status = 'Menunggu Persetujuan Notaris'
        result.approvers.push(args.idApproval)
      } else if (args.status === 'reject') {
        result.status = 'reject'
      }
    } else if (
      (result.status =
        'Menunggu Persetujuan Notaris' && user.userType === 'notaris')
    ) {
      if (args.status === 'approve') {
        result.status = 'Approve'
        result.approvers.push(args.idApproval)

        // Create Akta Tanah
        const aktaNetwork = await fabric.connectToNetwork(
          user.organizationName,
          'aktacontract',
          user.username
        )
        const akta = {
          id: uuidv4(),
          idDokumen: result.id,
          status: 'Menunggu Persetujuan Penjual',
          idPembeli: result.pembeli.id,
          idPenjual: result.penjual.id,
          approvers: [],
        }
        await aktaNetwork.contract.submitTransaction(
          'CreateAKTA',
          JSON.stringify(akta)
        )
        aktaNetwork.gateway.disconnect()
      } else if (args.status === 'reject') {
        result.status = 'reject'
      }
    } else if (result.status === 'reject') {
      return iResp.buildSuccessResponseWithoutData(200, 'Dokumen Telah ditolak')
    }
    await network.contract.submitTransaction(
      'UpdateDok',
      JSON.stringify(result)
    )
    network.gateway.disconnect()
    return iResp.buildSuccessResponseWithoutData(
      200,
      'Successfully Approve Dokumen'
    )
  } catch (error) {
    return iResp.buildErrorResponse(500, 'Something wrong', error.message)
  }
}
const update = async (user, args) => {
  try {
    const network = await fabric.connectToNetwork(
      user.organizationName,
      'dokcontract',
      user.username
    )
    await network.contract.submitTransaction('UpdateDok', JSON.stringify(args))
    network.gateway.disconnect()
    return iResp.buildSuccessResponseWithoutData(
      200,
      'Successfully update Dokumen'
    )
  } catch (error) {
    return iResp.buildErrorResponse(500, 'Something wrong', error.message)
  }
}

const getList = async (user, args) => {
  try {
    const network = await fabric.connectToNetwork(
      user.organizationName,
      'dokcontract',
      user.username
    )
    const result = await network.contract.submitTransaction('ReadAllDok')
    network.gateway.disconnect()
    return iResp.buildSuccessResponse(
      200,
      'Successfully get all Dokumen',
      bufferToJson(result)
    )
  } catch (error) {
    return iResp.buildErrorResponse(500, 'Something wrong', error.message)
  }
}

module.exports = {
  getDokumenByIdPembeli,
  getDokumenByIdPenjual,
  getDokumenByStatus,
  getById,
  create,
  getList,
  generateIdentifier,
  verify,
  approve,
  update,
}
