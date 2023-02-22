# include .env file and export its env vars
# (-include to ignore error if it does not exist)
-include .env

all: clean remove install update solc build 

# Install proper solc version.
solc:; nix-env -f https://github.com/dapphub/dapptools/archive/master.tar.gz -iA solc-static-versions.solc_0_8_10

# Clean the repo
clean  :; forge clean

# Remove modules
remove :; rm -rf .gitmodules && rm -rf .git/modules/* && rm -rf lib && touch .gitmodules && git add . && git commit -m "modules"

# Install the Modules
install :; 
	forge install dapphub/ds-test --no-commit
	forge install OpenZeppelin/openzeppelin-contracts --no-commit

# Update Dependencies
update:; forge update

setup-yarn:
	yarn 

# TODO: fails on fleek due to "GLIBC_2.29 not found"
build-forge:
	curl -L https://foundry.paradigm.xyz | bash  # Need to reload PATH before foundryup
	~/.foundry/bin/foundryup
	~/.foundry/bin/forge build

# Install Foundry, node packages, and foundry libraries
fresh-install:
	curl -L https://foundry.paradigm.xyz | bash  # Need to reload PATH before foundryup
	foundryup
	npm install
	# make install  # forge build installs these

# Builds
build  :; forge clean && forge build --optimize --optimizer-runs 1000000

run: 
	(npm run dev | sed -e 's/^/[NPM] : /' & anvil | sed -e 's/^/[ANVIL] : /')

deploy-local:
	# source .env
	python3 deployCheq.py ${PRIVATE_KEY} "local"
	
deploy-mumbai:
	# source .env
	python3 deployCheq.py ${PRIVATE_KEY} "mumbai"

create-mumbai-data: # write cheqs from different modules, transfer, fund, cash
	# source .env
	python3 createCheq.py ${PRIVATE_KEY} "mumbai"

graph-start:
	# Requires docker to be running
	npm run clean-graph-node # If node has run before remove the old subgraph
	npm run run-graph-node  # (re)start the node [postgres & ipfs & blockchain ingester]
	# npm run codegen

graph-deploy-local:
	npm run graph-prepare-mumbai # TODO change to graph-prepare-local
	npm run create-local # 
	npm run graph-ship-local  # Send the subgraph to the node (May need delay before this command if graphNode not ready to receive subgraph)

graph-deploy-remote:
	npm run graph-prepare-mumbai
	npm run graph-create-remote # 
	npm run graph-ship-remote  # Send the subgraph to the node (May need delay before this command if graphNode not ready to receive subgraph)
