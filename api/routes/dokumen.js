const dokumenRouter = require('express').Router()
const dokumenController = require('../controllers/dokumen.js')
const auth = require('../middleware/auth.js')

dokumenRouter.post('/approve', auth.verifyToken, dokumenController.approve)
dokumenRouter.get(
  '/pembeli/:idPembeli',
  auth.onlyUser,
  dokumenController.getDokumenByIdPembeli
)
dokumenRouter.get(
  '/penjual/:idPenjual',
  auth.onlyUser,
  dokumenController.getDokumenByIdPenjual
)
dokumenRouter.post(
  '/identifier/:idDokumen',
  auth.onlyUser,
  dokumenController.generateIdentifier
)
dokumenRouter.post('/verify', auth.onlyUser, dokumenController.verify)
dokumenRouter.get('/:idDokumen', auth.verifyToken, dokumenController.getById)
dokumenRouter.put('/:idDokumen', auth.verifyToken, dokumenController.update)
dokumenRouter.post('/', auth.verifyToken, dokumenController.create)
dokumenRouter.get('/', auth.verifyToken, dokumenController.getList)

module.exports = dokumenRouter