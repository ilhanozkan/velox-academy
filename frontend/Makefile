.PHONY:
.DEFAULT_GOAL := dev


dev:
	docker-compose -p velox-frontend -f docker-compose.dev.yaml up -d --remove-orphans

build:
	docker-compose -p velox-frontend -f docker-compose.yaml up -d --remove-orphans