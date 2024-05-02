const sertifikatRouter = require('express').Router()
const sertifikatController = require('../controllers/sertifikat.js')
const auth = require('../middleware/auth.js')

sertifikatRouter.get(
  '/pemilik/:idPemilik',
  auth.verifyToken,
  sertifikatController.getCertificateByIdPemilik
)
sertifikatRouter.post(
  '/identifier/:idSertifikat',
  auth.verifyToken,
  sertifikatController.generateIdentifier
)
sertifikatRouter.post('/verify', auth.verifyToken, sertifikatController.verify)
sertifikatRouter.get(
  '/:idSertifikat',
  auth.verifyToken,
  sertifikatController.getById
)
sertifikatRouter.put(
  '/:idSertifikat',
  auth.verifyToken,
  sertifikatController.update
)
sertifikatRouter.post('/', auth.verifyToken, sertifikatController.create)

module.exports = sertifikatRouter
