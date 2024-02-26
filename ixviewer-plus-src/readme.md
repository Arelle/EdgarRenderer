# SEC IXViewer - Plus

---

**Your Local Machine must have**:

> [NodeJS](https://nodejs.org/en/download) V14+

> [NPM](https://nodejs.org/en/download) (this comes automatically with NodeJS)

---

## To Install on your Local Machine

1. [Clone](https://docs.gitlab.com/ee/gitlab-basics/start-using-git.html#clone-a-repository) this repository

2. Go to the root of this project in your terminal (this is where **package.json** lives)

3. Run `npm install` in your terminal

   - This could take a few minutes

4. Once finished, you can now use the **SEC IXViewer - Plus**

## NPM Commands

Run these in a terminal from the root of your project

1. Run the project in DEVELOPMENT MODE
   - `npm run dev-serve` 
   <!-- `npm run dev-build` needs to have been run first because devServer.static is currently pointing to /dist and that folder needs to be populated with the build command -->
2. Run the project in DEVELOPMENT MODE and include a bundle analyzer
   - `npm run dev-serve-analyze`
3. Run the project in PRODUCTION MODE with a development server
   - `npm run prod-serve`
4. Run the project in PRODUCTION MODE with a development server and include a bundle analyzer
   - `npm run prod-serve-analyze`
5. Run the unit tests
   - `npm run unit-test`
6. Get Filings from RSS Feed(s) **follow the prompt in the terminal**
   - `npm run get-filings-menu`
7. Get Filings from RSS Feed(s) **newest 200 inline filings**
   - `npm run get-filings`
8. Run the project in Sandbox mode (for our local testing server)
   - `npm run sandbox`
9. Build the PRODUCTION application (to go to SEC.gov, WorkStation, Etc...) all necessary files will be placed in {{project_root}}/dist/\*\*
   - `npm run production`
10. Build the project in Automated Testing Mode (with Cypress which has serious issues with XHTML)
    - `npm run automated-test`

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