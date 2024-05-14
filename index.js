const express = require('express');
const cors = require('cors');
const multer = require('multer');

const app = express();
const upload = multer();

app.use(cors());

app.listen(3000, () => {
  console.log('Server running on port 3000');
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
