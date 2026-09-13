.DEFAULT_GOAL := help

NODE ?= node
PYTHON ?= python3
HOST ?= 127.0.0.1
PORT ?= 8765

.PHONY: help test check test-ui serve

help:
	@echo "Available targets:"
	@echo "  test     Run lesson and shell checks"
	@echo "  check    Check JavaScript syntax and run lesson tests"
	@echo "  serve    Serve dist/ at http://$(HOST):$(PORT)"
	@echo "  test-ui  Run browser checks (start make serve on port 8765 first)"
	@echo ""
	@echo "Override NODE, PYTHON, HOST, or PORT as needed."
	@echo "test-ui uses the Chrome and Playwright paths in check-ui.mjs."

test:
	$(NODE) check-lessons.mjs

check: test
	$(NODE) --check dist/app.js
	$(NODE) --check dist/lessons.mjs
	$(NODE) --check dist/shell.mjs
	$(NODE) --check check-lessons.mjs
	$(NODE) --check check-ui.mjs

serve:
	$(PYTHON) -m http.server $(PORT) --bind $(HOST) --directory dist

test-ui:
	$(NODE) check-ui.mjs
