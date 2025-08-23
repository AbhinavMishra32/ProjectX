docker compose up --build
# Test
curl -s localhost:8080/ai/
curl -s localhost:8080/ai/echo/hello
curl -s localhost:8080/auth/
curl -s 'localhost:8080/auth/echo?text=hello'
# Stop
docker compose down