#!/bin/bash

HOME_DIR=$(pwd);
REPO=https://gitlab.oit.prdoit-cuse1.aces.sec.gov/dera/idap/group2/ix/ix-test-documents.git;
BRANCH=test-filings-ix-viewer;

# make the directory for test filings if it doesn't exist
mkdir -p ./dist;

# switch directories
cd ..;

# clone the test repo if needed
if ! test -d ./ix-test-documents; then
    git clone "$REPO";
fi

# checkout/update the correct branch
cd ./ix-test-documents || exit;
git checkout $BRANCH;
git fetch && git pull;

# install the test repo dependencies if needed
if ! test -d ./node_modules; then
    npm install;
fi

cd "$HOME_DIR" || exit;

echo "Copying test filings...";
cmd //c "mklink /J .\dist\Archives ..\ix-test-documents\Archives" &&
echo "Successfully copied test filings into ix-viewer2/dist/Archives/edgar/data."
