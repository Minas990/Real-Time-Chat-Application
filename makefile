#VARS
COMPOSE_FILE = docker-compose.yml

.PHONY: help
help:
	@echo ""
	@echo "Available commands:"
	@echo "  make build  -> Build the Docker images"
	@echo "  make up     -> Build and start all containers"
	@echo "  make down   -> Stop and remove containers, networks, volumes"
	@echo "  make logs   -> View logs from all services"
	@echo ""

#build images
.PHONY: build
build:
	docker compose -f $(COMPOSE_FILE) build

#start containers
.PHONY: up
up:
	docker compose -f $(COMPOSE_FILE) up 

#stop containers
.PHONY: down
down:
	docker compose -f $(COMPOSE_FILE) down

#view logs
.PHONY: logs
logs:
	docker compose -f $(COMPOSE_FILE) logs -f
