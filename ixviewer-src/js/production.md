Created by staff of the U.S. Securities and Exchange Commission.
Data and content created by government employees within the scope of their employment are not subject to domestic copyright protection. 17 U.S.C. 105.

# Production README

## Purpose
Steps required to put the IXViewer into Production mode (specifically production.min.js)

## Prerequisites
 - [NodeJS](https://nodejs.org/en/) must be installed on your SEC computer, as well as NPM and the NodeJS Command Prompt (these are all installed as a bundle)
 - NodeJS Version: 6.2.2 or higher
 - NPM Version: 3.9.5 or higher

## Steps

 1. Ensure the Gulp directory is up-to-date with the latest release. (../gulp/*)
 2. In the NodeJS Command Prompt go to the location of the Gulp directory
 3. If you have not installed the required NPM packages, you will need to run `npm install` in the NodeJS Command Prompt
 4. From the NodeJS Command Prompt and in the Gulp directory run `npm run start`
	 *If you are given errors, your JS is not well formed, and will require you to fix these errors.*
 5. production.min.js is now updated to reflect all changes accomplished in the JS files.