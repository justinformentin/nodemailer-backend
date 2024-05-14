const express = require('express');
const cors = require('cors');
const multer = require('multer');
const dotenv = require('dotenv');
const nJwt = require('njwt');
dotenv.config();

const app = express();
const upload = multer();

app.use(cors());

app.listen(3000, () => {
  console.log('Server running on port 3000');
});

app.use((req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(403).json({ error: 'No credentials sent.' });
  } else {
    const token = req.headers.authorization.split(' ')[1]
    nJwt.verify(token, process.env.SIGNING_KEY, (err, verifiedJwt) => {
      if (err) {
        return res.status(403).json({ error: err });
      } else {
        next();
      }
    });
  }
});

app.post('/api/v1/submit-contact', upload.none(), (req, res, next) => {
  const body = req.body;
  console.log('body', body)
  if (req.body) {
    res.status(200).send({ message: 'Form sent' });
  } else {
    return res.status(400).send({ message: 'Missing body' });
  }
});
