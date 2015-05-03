all : q3.js

TS_FILES = $(shell find . -type f -name '*.ts')

q3.js : q3.ts $(TS_FILES)
	tsc $< --out $@

definitions : equations_solver.d.ts

equations_solver.d.ts :
	tsc -d equations_solver.ts
