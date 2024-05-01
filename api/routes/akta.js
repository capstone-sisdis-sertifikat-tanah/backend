const aktaRouter = require('express').Router()
const aktaController = require('../controllers/akta.js')
const auth = require('../middleware/auth.js')

aktaRouter.post('/approve', auth.onlyUser, aktaController.approve)
aktaRouter.get(
  '/pembeli/:idPembeli',
  auth.onlyUser,
  aktaController.getAktaByIdPembeli
)
aktaRouter.get(
  '/penjual/:idPenjual',
  auth.onlyUser,
  aktaController.getAktaByIdPenjual
)
aktaRouter.post(
  '/identifier/:idAkta',
  auth.onlyUser,
  aktaController.generateIdentifier
)
aktaRouter.post('/verify', auth.onlyUser, aktaController.verify)
aktaRouter.get('/:idAkta', auth.verifyToken, aktaController.getById)
aktaRouter.put('/:idAkta', auth.verifyToken, aktaController.update)
aktaRouter.post('/', auth.verifyToken, aktaController.create)

module.exports = aktaRouter
