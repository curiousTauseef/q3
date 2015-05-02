TS_FILES = $(shell find . -type f -name '*.ts')

q3.js : q3.ts $(TS_FILES)
	tsc $< --out $@
