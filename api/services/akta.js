const iResp = require('../utils/response.interface.js')
const fabric = require('../utils/fabric.js')
const { BlockDecoder } = require('fabric-common')
const { bufferToJson } = require('../utils/converter.js')
const { v4: uuidv4 } = require('uuid')

const create = async (user, args) => {
  try {
    const network = await fabric.connectToNetwork(
      user.organizationName,
      'aktacontract',
      user.username
    )
    await network.contract.submitTransaction('CreateAKTA', JSON.stringify(args))
    network.gateway.disconnect()
    return iResp.buildSuccessResponseWithoutData(
      200,
      'Successfully registered a new Akta'
    )
  } catch (error) {
    return iResp.buildErrorResponse(500, 'Something wrong', error.message)
  }
}

const getById = async (user, args) => {
  try {
    const network = await fabric.connectToNetwork(
      user.organizationName,
      'aktacontract',
      user.username
    )
    const result = await network.contract.submitTransaction('GetAktaById', args)
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

const getAktaByIdPembeli = async (user, data) => {
  try {
    const idPembeli = data
    const network = await fabric.connectToNetwork(
      user.organizationName,
      'aktacontract',
      user.username
    )

    const result = await network.contract.submitTransaction(
      'GetAllAktaByPembeli',
      idPembeli
    )
    network.gateway.disconnect()
    return iResp.buildSuccessResponse(
      200,
      `Successfully get akta by id pembeli: ${idPembeli}`,
      JSON.parse(result)
    )
  } catch (error) {
    return iResp.buildErrorResponse(500, 'Something wrong', error.message)
  }
}
const getAktaByIdPenjual = async (user, data) => {
  try {
    const idPenjual = data
    const network = await fabric.connectToNetwork(
      user.organizationName,
      'aktacontract',
      user.username
    )

    const result = await network.contract.submitTransaction(
      'GetAllAktaByPenjual',
      idPembeli
    )
    network.gateway.disconnect()
    return iResp.buildSuccessResponse(
      200,
      `Successfully get akta by id penjual: ${idPenjual}`,
      JSON.parse(result)
    )
  } catch (error) {
    return iResp.buildErrorResponse(500, 'Something wrong', error.message)
  }
}

const generateIdentifier = async (user, idAkta) => {
  try {
    var network = await fabric.connectToNetwork(
      user.organizationName,
      'aktacontract',
      user.username
    )
    const akta = JSON.parse(
      await network.contract.evaluateTransaction('GetAktaById', idAkta)
    )

    network.gateway.disconnect()

    const identifier = {}
    network = await fabric.connectToNetwork('Kementrian', 'qscc', 'admin')

    const blockAkta = await network.contract.evaluateTransaction(
      'GetBlockByTxID',
      'bpnchannel',
      akta.txId[akta.txId.length - 1]
    )

    identifier.akta = fabric.calculateBlockHash(
      BlockDecoder.decode(blockAkta).header
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
    const blockAkta = await network.contract.evaluateTransaction(
      'GetBlockByHash',
      'bpnchannel',
      Buffer.from(identifier.akta, 'hex')
    )

    // Get data from block
    const argsAkta =
      BlockDecoder.decode(blockAkta).data.data[0].payload.data.actions[0]
        .payload.chaincode_proposal_payload.input.chaincode_spec.input.args
    const idAkta = Buffer.from(argsAkta[1]).toString()

    console.log('ID Akta: ', idAkta)
    //query data ijazah, transkrip, nilai
    network.gateway.disconnect()

    const aktaNetwork = await fabric.connectToNetwork(
      user.organizationName,
      'aktacontract',
      user.username
    )
    const akta = await aktaNetwork.contract.evaluateTransaction(
      'GetAktaById',
      idAkta
    )
    aktaNetwork.gateway.disconnect()
    const parseData = JSON.parse(akta)

    parseData.signatures = await fabric.getAllSignature(parseData.txId)
    console.log(parseData)
    const data = {
      akta: parseData,
    }

    const result = {
      success: true,
      message: 'Akta asli',
      data: data,
    }
    return iResp.buildSuccessResponse(200, 'Successfully get Akta', result)
  } catch (error) {
    console.log('ERROR', error)
    const result = {
      success: true,
      message: 'Akta palsu',
    }
    return iResp.buildErrorResponse(500, 'Something wrong', result)
  }
}

const approve = async (user, args) => {
  try {
    const network = await fabric.connectToNetwork(
      user.organizationName,
      'aktacontract',
      user.username
    )
    const result = JSON.parse(
      await network.contract.submitTransaction('GetAktaById', args.id)
    )
    network.gateway.disconnect()
    if (
      (result.status =
        'Menunggu Persetujuan Penjual' && user.id === result.penjual.id)
    ) {
      if (args.status === 'approve') {
        result.status = 'Menunggu Persetujuan Pembeli'
        result.approvers.push(args.idApproval)
      } else if (args.status === 'reject') {
        result.status === 'reject'
      }
    } else if (
      (result.status =
        'Menunggu Persetujuan Pembeli' && user.id === result.pembeli.id)
    ) {
      if (args.status === 'approve') {
        result.status = 'Approve'
        result.approvers.push(args.idApproval)

        // Update Akta Tanah 1x Transaction
        const sertifikatNetwork = await fabric.connectToNetwork(
          user.organizationName,
          'certcontract',
          user.username
        )

        const userNetwork = await fabric.connectToNetwork(
          user.organizationName,
          'usercontract',
          user.username
        )

        // Update Sertifikat

        const sertifikat = JSON.parse(
          await sertifikatNetwork.contract.submitTransaction(
            'GetCertById',
            result.dokumen.sertifikat.id
          )
        )
        const user = JSON.parse(
          await userNetwork.contract.submitTransaction(
            'GetUserById',
            result.pembeli.id
          )
        )
        const aktaLama = sertifikat.akta
        sertifikat.pemilik = user
        sertifikat.akta = result
        userNetwork.gateway.disconnect()

        await sertifikatNetwork.contract.submitTransaction(
          'UpdateSertifikat',
          JSON.stringify(sertifikat)
        )
        sertifikatNetwork.gateway.disconnect()

        // Update Dokumen dan Akta yang sudah tidak berlaku

        const dokumenNetwork = await fabric.connectToNetwork(
          user.organizationName,
          'dokcontract',
          user.username
        )
        const dokumen = JSON.parse(
          await dokumenNetwork.contract.submitTransaction(
            'GetDokById',
            result.dokumen.id
          )
        )
        dokumen.status = 'Sudah Tidak Berlaku'
        await dokumenNetwork.contract.submitTransaction(
          'UpdateDok',
          JSON.stringify(dokumen)
        )
        dokumenNetwork.gateway.disconnect()

        aktaLama.status = 'Sudah Tidak Berlaku'
        await network.contract.submitTransaction(
          'UpdateAkta',
          JSON.stringify(aktaLama)
        )
      } else if (args.status === 'reject') {
        result.status = 'reject'
      }
    } else if (result.status === 'reject') {
      return iResp.buildSuccessResponseWithoutData(200, 'Akta Telah ditolak')
    }
    await network.contract.submitTransaction(
      'UpdateAkta',
      JSON.stringify(result)
    )
    network.gateway.disconnect()
    return iResp.buildSuccessResponseWithoutData(
      200,
      'Successfully Approve Akta'
    )
  } catch (error) {
    return iResp.buildErrorResponse(500, 'Something wrong', error.message)
  }
}
const update = async (user, args) => {
  try {
    const network = await fabric.connectToNetwork(
      user.organizationName,
      'aktacontract',
      user.username
    )
    await network.contract.submitTransaction('UpdateAkta', JSON.stringify(args))
    network.gateway.disconnect()
    return iResp.buildSuccessResponseWithoutData(
      200,
      'Successfully update Akta'
    )
  } catch (error) {
    return iResp.buildErrorResponse(500, 'Something wrong', error.message)
  }
}

module.exports = {
  getAktaByIdPembeli,
  getAktaByIdPenjual,
  getById,
  create,
  generateIdentifier,
  verify,
  approve,
  update,
}
