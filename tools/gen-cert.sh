mkdir -p cert
openssl req -x509 -newkey rsa:4096 -keyout cert/key.pem -out cert/cert.pem -sha256 -days 3650 -nodes -subj "/CN=localhost"
