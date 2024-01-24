const express = require('express')
require("dotenv").config()
const jwt = require("jsonwebtoken")
const app = express()
const bcrypt = require('bcrypt');
const { v4: uuid} = require('uuid')


const post = []
app.use(express.json())

const authenticateUser = async (req, res, next) => {
  const  { password, username }  = req.body;
  const user = post.find(pos => pos.username == username)
  console.log(user);
  if (user == null) {
    return res.status(404).json({message: "User does not exist"})
  }

  try {

    if (!(await bcrypt.compare(password, user.password))) {

        return res.status(400).json({message: "Incorrect password"})
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({message: err})
  }
  res.user = user;
  next();
}

const authenticateToken = (req, res, next) => {

  const autheHeader = req.headers['authorization'];
  const token = autheHeader && autheHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401)
  
  jwt.verify(token, process.env.ACCESS_SECRET_TOKEN, (err, user) => {
      if (err) return res.sendStatus(403)
      req.user = user;
    next()
  })
}

app.get('/post', authenticateToken, (req, res) => {
    res.json(post.filter(pos => pos.username == req.user.username))
})

app.get('/:id', (req, res) => {
    const user = post.find(pos => pos.id == req.params.id)
    if (user == null) {
        return res.status(400).json({message: "User does not exist"})
    }

    return res.status(200).json({message: user.message})
} )
app.post('/signin', async (req, res) => {
   const  {username, password}  = req.body;
   try {
    const Salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(password, Salt);
   const user =  post.push({
     id: uuid(),
     username: username,
     password: hashedPassword,
     message: `Hey ${username}`
    })
    console.log(user)
    
   return  res.status(200).json({Users: post})
   } catch (err) {
    console.log(err);
    return res.status(500).json({message: err})
   }
})
app.post('/login', authenticateUser, (req, res) => {

  const accessToken = jwt.sign(res.user, process.env.ACCESS_SECRET_TOKEN)

  return res.json({accessToken: accessToken})
})

app.listen(process.env.PORT, () => console.log(`Welcome to this server on http://localhost:3000`)
);
