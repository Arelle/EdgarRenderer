/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment 
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

'use strict';

var UserFiltersMoreFiltersMembersSetUp = {
  filtersSet : false,
  
  membersOptions : [ ],
  
  setMembers : function( callback ) {
    var foundDimensions = document.getElementById('dynamic-xbrl-form').querySelectorAll('[dimension*="Axis"]');
    var foundDimensionsArray = Array.prototype.slice.call(foundDimensions);
    var tempArray = [ ];
    foundDimensionsArray.forEach(function( current ) {
      
      if ( current && current['innerText'] ) {
        // gatherAllIDS.push(current.closest('[id]').getAttribute('id'))
        var tempObject = {
          'parentID' : current.closest('[id]').getAttribute('id'),
          'name' : current['innerText'].trim(),
          'label' : (current['innerText'].trim().split(':')[1].endsWith('Member')) ? (current['innerText'].trim()
              .split(':')[1].replace(/([A-Z])/g, ' $1').trim().slice(0, -7))
              : (current['innerText'].trim().split(':')[1].replace(/([A-Z])/g, ' $1').trim()),
        };
        
        // var memberExists =
        // UserFiltersMoreFiltersMembersSetUp.membersOptions.filter(function(
        // element ) {
        // return element['name'] === tempObject['name'];
        // });
        
        // console.log(memberExists);
        
        // if ( memberExists.length === 0 ) {
        // console.log('new name!');
        tempArray.push(tempObject);
        // UserFiltersMoreFiltersMembersSetUp.membersOptions.push(tempObject);
        
        // }
      }
      
    });
    tempArray.sort(function( first, second ) {
      if ( first['label'] > second['label'] ) {
        return 1
      }
      if ( first['label'] < second['label'] ) {
        return -1;
      }
      return 0;
    });
    
    var setAllParentIDS = function( currentName, finalized, tempArray, iterate ) {
      for ( iterate = iterate || 0; iterate < tempArray.length; iterate++ ) {
        if ( tempArray[iterate]['name'] === currentName ) {
          finalized[finalized.length - 1]['parentID'].push(tempArray[iterate]['parentID']);
        } else {
          finalized.push({
            'parentID' : [ tempArray[iterate]['parentID'] ],
            'name' : tempArray[iterate]['name'],
            'label' : tempArray[iterate]['label']
          });
          return setAllParentIDS(tempArray[iterate]['name'], finalized, tempArray, iterate);
        }
      }
      return finalized;
    }
    document.getElementById('filters-members-count').innerText = UserFiltersMoreFiltersMembersSetUp.membersOptions.length;
    if ( tempArray.length ) {
      var currentName = tempArray[0]['name'];
      
      var finalized = [ {
        'parentID' : [ ],
        'name' : tempArray[0]['name'],
        'label' : tempArray[0]['label'],
      } ];
      
      UserFiltersMoreFiltersMembersSetUp.membersOptions = setAllParentIDS(currentName, finalized, tempArray, 0);
      UserFiltersMoreFiltersMembersSetUp.populate();
    }
    callback();
  },
  
  populate : function( ) {
    var innerHtml = '';
    UserFiltersMoreFiltersMembersSetUp.membersOptions.forEach(function( current, index ) {
      innerHtml += '<div class="d-flex justify-content-between align-items-center w-100 px-2">';
      innerHtml += '<div class="form-check">';
      innerHtml += '<input  onclick="UserFiltersMoreFiltersMembers.clickEvent(event, this, ' + index
          + ')" title="Select/Deselect this option." class="form-check-input" type="checkbox" tabindex="9">';
      innerHtml += '<label class="form-check-label">' + current['label'] + '</label>';
      innerHtml += '</div></div>';
    });
    document.getElementById('user-filters-members').innerHTML = innerHtml;
  }
};
