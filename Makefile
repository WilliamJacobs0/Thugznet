.PHONY: setup dev stop

setup:
	npm install
	docker compose up -d
	npm run db:migrate
	npm run db:seed

dev:
	npm run dev

stop:
	docker compose down
