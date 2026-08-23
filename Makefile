.PHONY: setup dev stop

setup:
	npm install
	docker compose up -d
	npm run db:migrate
	npm run db:seed

dev:
	docker compose up -d
	npm run dev

stop:
	docker compose down
