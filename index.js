const express = require('express');
const cors = require('cors');
const multer = require('multer');
const dotenv = require('dotenv');
const nJwt = require('njwt');
const file = require('./emaillist.json');

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
    const token = req.headers.authorization.split(' ')[1];
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
  const email = req && req.body && req.body.email;
  const domain = email && email.split('@')[1];

  if (domain && !file.includes(domain)) {
    const keyVal = (key) => `<div>${key}: ${req.body[key]}</div>`;
    const html = `
    <div>
      ${Object.keys(req.body).map(keyVal).join('')}
    </div>`;

    res.status(200).send({ message: 'Form sent ' + html });
  } else {
    return res.status(400).send({
      message: !email
        ? 'Email missing'
        : 'Email from ' + domain + ' not allowed',
    });
  }
});
