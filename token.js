const nJwt = require('njwt');
const secureRandom = require('secure-random');

const signingKey = process.env.SIGNING_KEY || secureRandom(256, { type: 'Buffer' }); // Create a highly random byte array of 256 bytes

function createToken(sub, exp) {
  const claims = {
    iss: process.env.SERVICE_URL, // The URL of your service
    sub, // The UID of the user in your system
    scope: 'self, admins',
    exp: null,
  };

  const jwt = nJwt.create(claims, signingKey);
  jwt.setExpiration(new Date(exp));
  const token = jwt.compact();
  console.log(token);
  return token;
}

function verifyToken(token, verifiedCb) {
  nJwt.verify(token, signingKey, function (err, verifiedJwt) {
    if (err) {
      console.log(err); // Token has expired, has been tampered with, etc
    } else {
      console.log(verifiedJwt); // Will contain the header and body
      verifiedCb(verifiedJwt);
    }
  });
}
