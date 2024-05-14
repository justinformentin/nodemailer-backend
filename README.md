I wanted to setup a quick and easy email signup form. There are many resources telling you to use a service like SendGrid, or google forms, and while I have used them and they are fine, I wanted to set something up right now for $0.

I decided on using [nodemailer](https://www.nodemailer.com/) with gmail. 

>! This is just a quick and dirty sign up form hosted on your own server. This isn't the most flexible, secure email solution.

## Prerequisites

1. **VPS** - you need somewhere to be able to run the server, and you should have an understanding of the basics of web hosting. I'm using a VPS that I can SFTP into, with my domain already connected, and apache2 already set up. This is a server where I'm already hosting websites. *If you're starting from scratch, you're going to want to look into how and where you can deploy a node script.*
2. **Gmail account** - this is what we are using for sending/receiving emails.
3. **Node** - This is a node server

## Reverse Proxy

We are running the server on a port, so we need to set the proxy to that port. 

For example, we have server running on `domain.com:3000`. We have our `api/v1/endpoint` that we want to be able to hit.

Setting up the proxy allows us to make calls to `domain.com/api/v1/endpoint`, even though the server is running on a port.

### Apache 2

>! The following assumes your apache service is already set up and running.

If not already installed, install the proxy modules:

```bash
sudo a2enmod proxy proxy_http proxy_balancer lbmethod_byrequests
```

```bash 
sudo systemctl restart apache2
```

In `/etc/apache2/sites_available/yourdomain.conf`, add the proxy information.

The port must match your server port.

```
<VirtualHost *:80>
    ProxyPreserveHost On
    ProxyPass / http://localhost:3000/
    ProxyPassReverse / http://localhost:3000/
</VirtualHost>
```

[Full guide](https://www.digitalocean.com/community/tutorials/how-to-use-apache-http-server-as-reverse-proxy-using-mod_proxy-extension-ubuntu-20-04) from DigitalOcean.

### Nginx

[Full guide](https://www.digitalocean.com/community/tutorials/how-to-configure-nginx-as-a-reverse-proxy-on-ubuntu-22-04) from DigitalOcean.

## Running the server

We want the server to run indefinitely, and restart if our apache or nginx service restarts.

This shows how to use `pm2`, but there are other ways to accomplish indefinitely running node servers.

### package.json

Make sure the npm script to start the server exists, because this is the script `pm2` will run.

```json
  "scripts": {
    "start": "node index.js"
  }
```

### PM2

Install pm2 globally:

```bash
sudo npm install pm2@latest -g
```

```bash
pm2 start npm --name "app name" -- start
```

The server will now restart if the app crashes or restarts. 

Getting the server to start on system startup requires additional steps [found here](https://www.digitalocean.com/community/tutorials/how-to-set-up-a-node-js-application-for-production-on-ubuntu-20-04).

Full [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/).

## Setting up Gmail

1. Go to your [Google Account](https://myaccount.google.com/)
2. Select **Security**
3. Select **2-Step Verification**
4. At the bottom of the page select **App Passwords**
5. Generate a new app password

This app password will be used to send the email using `nodemailer`.

### Environment Variables

There is an `.env-example` file that you can use as a boilerplate. Copy this file and rename is `.env`.

Take your newly created google app password, and enter it in the `EMAIL_PASSWORD` variable.

Change the `EMAIL_USER` variable to the email address that you used to generate the app password.

Leave the following variables alone:

```
EMAIL_SERVICE=Gmail
EMAIL_PORT=465
EMAIL_HOST=smtp.gmail.com
EMAIL_TLS=true
```

When you send an email using nodemailer, the email will be sent **from** your email address, **to** your email address. You are sending an email to yourself. If you're using this as an email signup, or contact form, the information of the person filling out the form will be captured by the form data, and sent in the body of the email.

## Example Usage

What can you expect from this endpoint after you've followed everything above?

Taking a look in the `index.html` file, we can see the endpoint that we are calling. In your case it will be `yourdomain.com/api/v1/submit-contact/` instead of `http://localhost:3000/api/v1/submit-contact`. It's a post request, and it takes form data.


### Data Format 
If you want to use something other than multipart/form-data, you can also use x-www-form-urlencoded or json. Just ensure the parsing is correct - in this example multer is being used to handle form-data.

### Auth
If you want to use authentication, dealing with a JWT is included in this example as well. Just include the `{headers: {authorization: 'Bearer ' + token}}` in the POST request.

### Expected End Result

Using the contact form example in the `index.html` file, if someone fills out that form and sends it, this is what the email you receive will look like:

```
from: your@email.com
to: your@email.com
subject: Contact Form

firstName: Form Filler's First Name
lastName: Form Filler's Last Name 
email: formfillers@email.com
comment: This is the comment the form filler writes.
```

firstName, lastName, email, and comment were all form fields.

