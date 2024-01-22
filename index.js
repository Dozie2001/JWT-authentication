const express = require('express')
require("dotenv").config()
const jwt = require("jsonwebtoken")
const app = express()
const bcrypt = require('bcrypt');
const { v4: uuid} = require('uuid')

const post = []
app.use(express.json())


app.get('/', (req, res) => {
    res.json(post)
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
app.post('/login', async (req, res) => {
  const  { password, username }  = req.body;
  const user = post.find(pos => pos.username == username)
  console.log(user);
  if (user == null) {
    return res.status(404).json({message: "User does not exist"})
  }

  try {

    if (!await bcrypt.compare(password, user.password)) {

        return res.status(400).json({message: "Incorrect password"})
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({message: err})
  }

})

app.listen(process.env.PORT, () => console.log(`Welcome to this server on http://localhost:3000`)
);
