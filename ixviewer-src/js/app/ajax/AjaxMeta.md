Created by staff of the U.S. Securities and Exchange Commission.
Data and content created by government employees within the scope of their employment are not subject to domestic copyright protection. 17 U.S.C. 105.

# AjaxForm README

## Purpose
This Object is specific to GET the requested form from the user.
It performs an [XHR](en.wikipedia.org/wiki/XMLHttpRequest) GET request based on the HelpersUrl Object. 
If this request completes, and has a status of 200:
 1. Check if the size of the XHTML file is within reasonable performance limits
 2.  Find the XML attributes in the <html> tag via REGEX.
 3. Set the XHTML (now HTML5) to `#dynamic-xbrl-form` and remove the     loading section, and return `true` via callback.

If this request does not complete or has a status of anything other than 200:
 - Remove the loading section, and return `false` via callback.

## Variables
 - N/A

## Functions

 - init(callback)
	 - Called in `AppInit.init(internalUrl, callback)

