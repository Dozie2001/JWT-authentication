const express = require('express');
const { v4: uuid } = require('uuid');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();

const app = express();
app.use(express.json());

const post = [];



const authenticateToken = (req, res, next) => {
  const autheHeader = req.headers['authorization'];
  const token = autheHeader && autheHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_SECRET_TOKEN, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
   
    next();
  });
};


app.get('/post', authenticateToken, (req, res) => {
  console.log(req.user);
  res.json(post.filter((pos) => pos.username == req.user.name));
});

app.get('/:id', (req, res) => {
  const user = post.find((pos) => pos.id == req.params.id);
  if (user == null) {
    return res.status(400).json({ message: 'User does not exist' });
  }

  return res.status(200).json({ message: user.message });
});

app.listen(process.env.PORT, () =>
  console.log(`Welcome to this server on http://localhost:3000`)
);
