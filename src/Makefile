PIP=/usr/local/bin/pip3
PYTHON=/usr/local/bin/python3

default:
	mkdir -p build/data
	$(PIP) install --target ./build requests
	cp data/*.json ./build/data/
	cp credentials.py lambda_function.py ./build

unit-tests: clean default
	cp unit_tests.py build/
	(cd build; $(PYTHON) unit_tests.py)

integration-tests: clean default
	cp integration_tests.py build/
	(cd build; $(PYTHON) integration_tests.py)

clean:
	rm -rf build __pycache__
