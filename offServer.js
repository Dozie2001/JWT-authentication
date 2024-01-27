const express = require('express');
const { v4: uuid } = require('uuid');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();

const app = express();
app.use(express.json());

const post = [];

// A function that creates generate access token
const generateAccesToken = (user) => {
  return jwt.sign(user, process.env.ACCESS_SECRET_TOKEN, {expiresIn: '60s'});


}


const authenticateUser = async (req, res, next) => {
  const { password, username } = req.body;
  const user = post.find((pos) => pos.username == username);

  if (user == null) {
    return res.status(404).json({ message: 'User does not exist' });
  }

  try {
    if (!(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: 'Incorrect password' });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err });
  }
  next();
};

app.post('/signin', async (req, res) => {
  const { username, password } = req.body;
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = {
      id: uuid(),
      username: username,
      password: hashedPassword,
      message: `Hey ${username}`,
    };

    post.push(user);
    console.log(user);

    return res.status(200).json({ Users: post });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err });
  }
});
let refreshTokens = []

app.post('/login', authenticateUser, (req, res) => {
  const user = { name: req.body.username}
  const refreshToken = jwt.sign(user, process.env.REFRESH_SECRET_TOKEN);
  refreshTokens.push(refreshToken);
  return res.json({refreshToken: refreshToken});
});


app.post('/token', (req, res) => {
  const refreshToken = req.body.token;
  
  if (!refreshToken) {
    return res.sendStatus(401);
  }

  if (!refreshTokens.includes(refreshToken)) {
    return res.sendStatus(403);
  }

  jwt.verify(refreshToken, process.env.REFRESH_SECRET_TOKEN, (err, user) => {
    if (err) {
      res.sendStatus(401);
    }

    const accessToken = generateAccesToken(user);
    return res.json({ accessToken: accessToken });
  });
});



app.get('/:id', (req, res) => {
  const user = post.find((pos) => pos.id == req.params.id);
  if (user == null) {
    return res.status(400).json({ message: 'User does not exist' });
  }

  return res.status(200).json({ message: user.message });
});


app.listen(process.env.PORT2, () =>
  console.log(`Welcome to this server on http://localhost:4000`)
);
