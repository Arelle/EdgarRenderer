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
9. Build the PRODUCTION application (to go to SEC.gov, WorkStation, Etc...) all necessary files will be placed in {{project_root}}/dist/\**
   - `npm run production`

## NOTES

- If you are developing and need filings to develop against:
  1.  Run `npm run get-filings-menu`.
      - Answer all prompts in the terminal, allow script to run (could take a while)
  2.  Once that is accomplished, run `npm run dev-serve` OR `npm run dev-serve-analyze`.
  3.  Open a browser and navigate to: `http://localhost:3000/ix.xhtml`
  4.  You will be presented with a table of all filings that you gathered during step 1.
- If you are developing, the linter runs automatically when you save any files within {{project_root}}/src. These errors / warnings are to be fixed prior to pushing up code for review.
