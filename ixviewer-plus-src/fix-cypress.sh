#!/bin/bash
#shellcheck disable=SC2086

# this script modifies Cypress's injection.js
# in C:\Users\<user>\AppData\Local\Cypress\Cache\12.17.4\Cypress\resources\app\packages\runner\dist\
# see https://confluence.edgar.sec.gov/display/ED/Cypress+Quick+Start for more info

START=$(pwd);
CYPRESS_VERSION=13.12;
CYPRESS_FOLDER=$(find $LOCALAPPDATA/Cypress/Cache/ -type d -name "$CYPRESS_VERSION*");
cd $CYPRESS_FOLDER/Cypress/resources/app/packages/runner/dist || exit;

# if the backup file exists, fix has already been applied
if test -f ./injection.bak.js; then
    echo "Cypress fix has already been applied.  Skipping.";
    #shellcheck disable=SC2164
    cd $START; # return to original folder
    exit 0;
fi

echo "Applying fix to Cypress...";

# make a backup
cp injection.js injection.bak.js;

# apply the fix: wrap the js in a CDATA comment
echo '//<![CDATA[' | cat - ./injection.js > temp && mv temp ./injection.js;
echo -e "\n//]]>" >> ./injection.js;


#shellcheck disable=SC2164
cd $START; # return to original folder
echo "Cypress fix successfully applied.";
