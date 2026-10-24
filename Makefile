.PHONY: help install run-api run-frontend docker-up docker-down test lint clean

help:
	@echo "FinCore AI Developer Command Menu"
	@echo "-----------------------------------"
	@echo "make install       - Install Python and Node dependencies"
	@echo "make run-api       - Launch FastAPI Data Warehouse server"
	@echo "make run-frontend  - Launch React Vite UI"
	@echo "make docker-up     - Build and run containers via Docker Compose"
	@echo "make docker-down   - Stop running containers"
	@echo "make test          - Run automated pytest suite"
	@echo "make clean         - Remove pycache, build artifacts, and logs"

install:
	pip install -r requirements.txt
	cd react-frontend && npm install

run-api:
	uvicorn main:app --reload --port 8000

run-frontend:
	cd react-frontend && npm run dev

docker-up:
	docker compose up --build -d

docker-down:
	docker compose down

test:
	pytest -v

clean:
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete
	rm -rf .pytest_cache
