# NPM_REGISTRY = "--registry=http://registry.npm.taobao.org"
NPM_REGISTRY = ""
CLST ?= SGP

install:
	@npm install $(NPM_REGISTRY)
	@cd dashboard&&bower install --verbose --force
	@cd ../

build:
	mkdir -p logs
	cp -rf configs/dashboard/clusters/$(CLST).js dashboard/admin/script/config.js
	rm -rf .tmp
	grunt ssi
	cp -rf configs/app/clusters/$(CLST).js configs/app/clusters/release.js

testBuild:
	mkdir -p logs
#	cp -rf configs/dashboard/clusters/$(CLST).js dashboard/admin/script/config.js
	cp -rf dashboard/admin/script/config_test.js dashboard/admin/script/config.js
	rm -rf .tmp
	grunt ssi
	cp -rf configs/app/clusters/$(CLST).js configs/app/clusters/release.js
	
run: build
	@NODE_ENV=dev node app.js
	
runPro: build
	@NODE_ENV=production node app.js


autoStart:
	@NODE_ENV=production nohup pm2 start app.js -i 1 --name CMS --max-memory-restart 1024M >> logs/cms.log 2>&1 &

autoRestart:
	@NODE_ENV=production nohup pm2 restart CMS >> logs/cms.log 2>&1 &

start: install build
	@NODE_ENV=production nohup pm2 start app.js -i 1 --name CMS --max-memory-restart 1024M >> logs/cms.log 2>&1 &

restart: install build
	@NODE_ENV=production nohup pm2 restart CMS >> logs/cms.log 2>&1 &

testStart: install testBuild
	@NODE_ENV=test nohup pm2 start app.js -i 1 --name CMS --max-memory-restart 1024M >> logs/cms.log 2>&1 &

testRestart: testBuild
	@NODE_ENV=test nohup pm2 restart CMS >> logs/cms.log 2>&1 &
	
lsof:
	@lsof -i:5199	
pmweb:
	@pm2-web --config=../pm2-web.json		
	
pullRestart:
	git status
	git reset --hard
	git pull
	make restart

pullTestRestart:
	git status
	git reset --hard
	git pull
	make testRestart