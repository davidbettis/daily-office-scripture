default: build

build: 
	(cd src; make)
	npm run build

clean:
	(cd src; make clean)
	rm -rf cdk.out

diff:
	cdk --profile cdk diff

deploy: build
	npm run build && cdk --profile cdk deploy
