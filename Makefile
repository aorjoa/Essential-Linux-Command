.DEFAULT_GOAL := help

NODE ?= node
PYTHON ?= python3
HOST ?= 127.0.0.1
PORT ?= 8765

.PHONY: help test check test-ui test-download test-scenarios serve

help:
	@echo "Available targets:"
	@echo "  test     Run lesson and shell checks"
	@echo "  check    Check JavaScript syntax and run lesson tests"
	@echo "  serve    Serve dist/ at http://$(HOST):$(PORT)"
	@echo "  test-ui  Run browser checks (start make serve on port 8765 first)"
	@echo "  test-download  Verify ZIP and local Bun project (requires server, Bun, make, unzip)"
	@echo "  test-scenarios  Check the five workflow scenarios (requires server)"
	@echo ""
	@echo "Override NODE, PYTHON, HOST, or PORT as needed."
	@echo "test-ui uses the Chrome and Playwright paths in check-ui.mjs."

test:
	$(NODE) check-lessons.mjs

check: test
	$(NODE) --check dist/app.js
	$(NODE) --check dist/lessons.mjs
	$(NODE) --check dist/shell.mjs
	$(NODE) --check dist/workflow-project.mjs
	$(NODE) --check dist/workflow-scenarios.mjs
	$(NODE) --check dist/zip.mjs
	$(NODE) --check dist/env-model.mjs
	$(NODE) --check dist/env-lesson.mjs
	$(NODE) --check check-lessons.mjs
	$(NODE) --check check-ui.mjs
	$(NODE) --check check-download.mjs
	$(NODE) --check check-scenarios.mjs

serve:
	$(PYTHON) -m http.server $(PORT) --bind $(HOST) --directory dist

test-ui:
	$(NODE) check-ui.mjs

test-download:
	$(NODE) check-download.mjs

test-scenarios:
	$(NODE) check-scenarios.mjs
