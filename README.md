To create key and certifacte in order to connect with https run this command at the root

**_NOTE:_** openssl req -x509 -newkey rsa:4096 -nodes -keyout key.pem -out cert.pem -days 365