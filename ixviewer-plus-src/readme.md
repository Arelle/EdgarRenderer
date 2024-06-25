# SEC IXViewer - Plus

---

**Your Local Machine must have**:

> [NodeJS](https://nodejs.org/en/download) V14+

> [NPM](https://nodejs.org/en/download) (this comes automatically with NodeJS)

---

## To Install on your Local Machine

1. [Clone](https://docs.gitlab.com/ee/gitlab-basics/start-using-git.html#clone-a-repository) this repository

2. Go to the root of this project in your terminal (this is where **package.json** lives)

3. Run `npm install` in your terminal.  
   - This could take a few minutes

4. Fix cypress (if you're going to run cypress yourself)
   `bash fix-cypress.sh`
   Cypress doesn't play well with xhtml so we have to run this script.
   
5. Create filings repo (in group2 (parent to ixviewer-2)), and link /Archives/edgar/data to the filing in that repo.
   localhost only / dev machines; NOT dev1.
   `bash copy-test-files.sh`
   This step takes a while...

## NPM Commands
note: these instructions may be out of date. Best to just go read package.json

Run these in a terminal from the root of your project

1. Run the project in DEVELOPMENT MODE
   - `npm run dev-serve`
   - webpack looks for static assets on ./dist  Symlink ./dist to sibling filings repo with 
   - `cmd //c "mklink /J .\dist\Archives ..\ix-test-documents\Archives"`
   - \ix-test-documents repo (branch: test-filings-ix-viewer) will need to be sibling to ix-viewer2
2. Run the project in DEVELOPMENT MODE and include a bundle analyzer
   - `npm run dev-serve-analyze`
3. Run the project in PRODUCTION MODE with a development server
   - `npm run prod-serve`
4. Run the project in PRODUCTION MODE with a development server and include a bundle analyzer
   - `npm run prod-serve-analyze`
5. Run the unit tests
   - `npm run unit-test`
6. Run the project in Sandbox mode (for our local testing server)
   - `npm run sandbox`
7. Build the PRODUCTION application
   Default prod build (sec or dev1, etc) will be built in ./dist
   - `npm run build-prod`
8. Build the WORKSTATION version of application
   will be built in ./dist-ws
   - `npm run build-workstation`
9. Open Cypress Gui
   - `npx cypress open`
10. Run cypress command line
   - `npx cypress run`

## NOTES

- If you are developing and need filings to develop against:
  1.  Run `npm run get-filings-menu`.
      - Answer all prompts in the terminal, allow script to run (could take a while)
  2.  Once that is accomplished, run `npm run dev-serve` OR `npm run dev-serve-analyze`.
  3.  Open a browser and navigate to: `http://localhost:3000/ix.xhtml`
  4.  You will be presented with a table of all filings that you gathered during step 1.
- If you are developing, the linter runs automatically when you save any files within {{project_root}}/src. These errors / warnings are to be fixed prior to pushing up code for review.

## Cypress Quick Start
1. Download zip from cypress.io
2. Install zip with npm (in bash): 
<!-- generic -->
`CYPRESS_INSTALL_BINARY=C:/Users/<you>/Downloads/cypress.zip npm install --save-dev cypress`
(alter the path your path to zip).
<!-- robin (for ez copy pasta) -->
`CYPRESS_INSTALL_BINARY=C:/Users/nelsonro/Downloads/cypress.zip npm install --save-dev cypress`
Note: this  must be run in a bash shell, not cmd or powershell.
3. To Run against an xml app you will have to edit a cypress file found on a path similar to: `C:\Users\nelsonro\AppData\Local\Cypress\Cache\13.3.1\Cypress\resources\app\packages\runner\dist\injection.js`.  Add blank lines before an after the single (long) line of code.  On the first blank line add `//<![CDATA[`.  On the last line put `//]]>`
4. Now you can launch the cypress gui with `npx cypress open`.
5. to target a particular domain from the command line use --env flag:
   npx cypress run --env "domain=dev1"
6. To use particular domain for gui see env var 'domain' in cypress.config.js

## Troubleshooing
Cannot unzip
link of interest: https://artifactory.edgar.sec.gov/ui/packages/npm:%2F%2Fcypress?name=cypress&type=packages


## (WIP) Install Cypress Binary using Scripts (TODO: write script to do step 3 above and delete cypress from package.json (so it doesn't throw errors on dev1 where cypress is not installed))
- download
- install
- run scripts to delete from package.json?
- run script to change CDATA in file.
- instructions for reinstall
   - delete old cypress installs from local and roaming
   - follow stesp above


## Build Prod
npm run build-prod

## Deploy Prod
zip the /dist/ folder and re-name to something that matches releae version => e.g. release_24.2.01
copy to sharepoint folder and update the release notes table in confluence.

## git
dev branches
plus: ix-dev
legacy: v23-dev