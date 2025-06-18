# Generate self-signed cert for localhost (valid for 365 days)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/localhost.key \
  -out nginx/localhost.crt \
  -subj "/CN=localhost"
