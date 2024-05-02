const iResp = require('../utils/response.interface.js')
const sertifikatService = require('../services/sertifikat.js')
const { v4: uuidv4 } = require('uuid')

const getById = async (req, res) => {
  const result = await sertifikatService.getById(
    req.user,
    req.params.idSertifikat
  )

  res.status(result.code).send(result)
}

const generateIdentifier = async (req, res) => {
  const data = req.params.idSertifikat
  const result = await sertifikatService.generateIdentifier(req.user, data)
  res.status(result.code).send(result)
}

const verify = async (req, res) => {
  const data = req.body

  const identifier = data.identifier

  const result = await sertifikatService.verify(req.user, identifier)
  res.status(result.code).send(result)
}

const create = async (req, res) => {
  const data = req.body
  const args = {
    id: uuidv4(),
    idPemilik: data.idPemilik,
    idAkta: null,
    lat: data.lat,
    long: data.long,
  }
  const result = await sertifikatService.create(req.user, args)

  res.status(result.code).send(result)
}

const getCertificateByIdPemilik = async (req, res) => {
  const data = req.params.idPemilik
  const result = await sertifikatService.getCertificateByIdPemilik(
    req.user,
    data
  )
  res.status(result.code).send(result)
}

const update = async (req, res) => {
  const data = req.body
  const args = {
    id: req.params.idSertifikat,
    idPemilik: data.pemilik,
    idAkta: data.akta,
    lat: data.lat,
    long: data.long,
  }

  const result = await sertifikatService.update(req.user, args)

  res.status(result.code).send(result)
}

module.exports = {
  getCertificateByIdPemilik,
  getById,
  create,
  generateIdentifier,
  verify,
  update,
}