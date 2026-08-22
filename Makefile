.PHONY: run stop

run:
	powershell -NoProfile -ExecutionPolicy Bypass -File scripts/dev.ps1

stop:
	powershell -NoProfile -ExecutionPolicy Bypass -File scripts/stop.ps1
