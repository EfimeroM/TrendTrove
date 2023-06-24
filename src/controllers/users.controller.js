const UserDAO = require('../db/daos/usersDAO')
const { passwordIsValid } = require('../utils/bcrypt')
const { generateToken } = require('../utils/jwt')
require('dotenv').config()

class UserController {
  constructor () {
    this.dao = new UserDAO()
    this.nameDao = this.constructor.name.replace('Controller', '').toLowerCase()
  }

  handleResponse = (res, status, message, data = {}) => res.status(status).json({ message, data })

  signup = async (req, res) => {
    try {
      const newUser = {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password
      }
      const user = await this.dao.add(newUser)
      this.handleResponse(res, 201, 'User added', user)
    } catch (error) {
      this.handleResponse(res, 500, error.message)
    }
  }

  login = async (req, res) => {
    try {
      const { email, password } = req.body
      const user = await this.dao.getByEmail(email)
      if (!user) return this.handleResponse(res, 404, 'User not found')
      if (!passwordIsValid(user, password)) return this.handleResponse(res, 401, 'Invalid password')
      const payload = { id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin }
      const token = generateToken(payload, process.env.JWT_SECRET_KEY)
      const newUser = { ...payload, token }
      req.user = {...newUser}
      this.handleResponse(res, 200, 'User logged', newUser)
    } catch (error) {
      console.log(error)
      this.handleResponse(res, 500, error.message)
    }
  }
}

module.exports = UserController