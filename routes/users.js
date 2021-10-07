const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')

//User model
const User = require('../models/User')

//Login Page
router.get('/login', (req, res) => res.render('login'))

//Register Page
router.get('/register', (req, res) => res.render('register'))

//Register Handle
router.post('/register', (req, res) => {
  const { name, email, password, password2 } = req.body
  let errors = []

  //Check required fields
  if (!name || !email || !password || !password2) {
    errors.push({ msg: 'Please fill in all fields' })
  }

  //Check passwords match
  if (password !== password2) {
    errors.push({ msg: 'Passwords do not match' })
  }

  //Check the password length
  if (password.length < 8) {
    errors.push({ msg: 'Password should be at least 8 characters' })
  }

  if (errors.length > 0) {
    res.render('register', {
      errors,
      name,
      email,
      password,
      password2
    })
  } else {
    //Validation passed at this point
    User.findOne({ email: email })
        .then(user => {
            if (user) {
                //User already exists
                errors.push({ msg: 'Email is already registered' })
                res.render('register', {
                    errors,
                    name,
                    email,
                    password,
                    password2
                  })
            } else {
                const newUser = new User ({
                    name,
                    email,
                    password
                })
                //Hash password
                bcrypt.genSalt(10, (err, salt) => bcrypt.hash(newUser.password, salt, (err, hash) => {
                    if (err) throw err
                    //Set password to hashed
                    newUser.password = hash
                    // Save user
                    newUser.save()
                        .then(user => {
                            res.redirect('/users/login')
                        })
                        .catch(err => console.log(err))
                }))
            }   
        })
        .catch()
  }
})

module.exports = router
