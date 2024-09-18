const express = require('express')
const router = express.Router()
const user = require('../controllers/user')
const { authenticate, authorizeAdmin } = require('../middlewares/middleware')

// Definisikan rute
router.get('/all', authenticate, authorizeAdmin, user.getAllUsers)
router.get('/profile', authenticate, user.getUserProfile)
router.get('/:id', authenticate, authorizeAdmin, user.getUserById)
router.put('/profile', authenticate, user.updateProfile)
router.post('/register', user.register)
router.post('/auth', user.login)
router.post('/logout', user.logout)
router.delete('/delete/:id', authenticate, authorizeAdmin, user.deleteUserbyAdmin)

// Ekspor router
module.exports = router