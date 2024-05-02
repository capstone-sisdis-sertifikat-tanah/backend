const aktaRouter = require('express').Router()
const aktaController = require('../controllers/akta.js')
const auth = require('../middleware/auth.js')

aktaRouter.post('/approve', auth.verifyToken, aktaController.approve)
aktaRouter.get(
  '/pembeli/:idPembeli',
  auth.verifyToken,
  aktaController.getAktaByIdPembeli
)
aktaRouter.get(
  '/penjual/:idPenjual',
  auth.verifyToken,
  aktaController.getAktaByIdPenjual
)
aktaRouter.post(
  '/identifier/:idAkta',
  auth.verifyToken,
  aktaController.generateIdentifier
)
aktaRouter.post('/verify', auth.verifyToken, aktaController.verify)
aktaRouter.get('/:idAkta', auth.verifyToken, aktaController.getById)
aktaRouter.put('/:idAkta', auth.verifyToken, aktaController.update)
aktaRouter.post('/', auth.verifyToken, aktaController.create)

module.exports = aktaRouter
