const sertifikatRouter = require('express').Router()
const sertifikatController = require('../controllers/sertifikat.js')
const auth = require('../middleware/auth.js')

sertifikatRouter.get(
  '/pemilik/:idPemilik',
  auth.onlyUser,
  sertifikatController.getCertificateByIdPemilik
)
sertifikatRouter.post(
  '/identifier/:idSertifikat',
  auth.onlyUser,
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
sertifikatRouter.post('/', auth.onlyUser, sertifikatController.create)

module.exports = sertifikatRouter
