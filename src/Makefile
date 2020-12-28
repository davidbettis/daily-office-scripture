default:
	mkdir -p build/data
	pip install --target ./build requests
	cp data/*.json ./build/data/
	cp credentials.py lambda_function.py ./build

unit-tests:
	python3 unit_tests.py

integration-tests: 
	python3 integration_tests.py 

clean:
	rm -rf build __pycache__
