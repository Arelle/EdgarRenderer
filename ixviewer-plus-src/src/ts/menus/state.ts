/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment 
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

//import * as bootstrap from "bootstrap";

export const MenusState = {

  toggle: (menuId: string, rightIfTrue: boolean, callback: (arg0: boolean) => void) => {

    const whichSide = (rightIfTrue) ? 'right' : 'left';
    if (MenusState.openMenu !== '' && MenusState.openMenu !== menuId) {
      const whichSavedSide = (MenusState.openMenuSide) ? 'right' : 'left';
      document.getElementById(MenusState.openMenu)!.style[whichSavedSide] = '-100%';

      document.getElementsByClassName('main-container')[0].classList.remove('col-sm-9');
      document.getElementsByClassName('main-container')[0].classList.remove('offset-sm-3');

      MenusState.openMenu = '';
      MenusState.openMenuSide = null;
    }

    if (document.getElementById(menuId)?.style[whichSide] === '0px') {
      // close the menu
      document.getElementById(menuId)?.classList.add('invisible');
      document.getElementById(menuId)!.style[whichSide] = '-100%';

      document.getElementsByClassName('main-container')[0].classList.remove('col-sm-9');
      document.getElementsByClassName('main-container')[0].classList.remove('offset-sm-3');

      MenusState.openMenu = '';
      MenusState.openMenuSide = null;
      callback(false);

    } else {

      // open the menu
      if (rightIfTrue) {
        document.getElementById(menuId)?.classList.remove('invisible');
        document.getElementById(menuId)!.style.right = '0px';
      } else {
        document.getElementById(menuId)?.classList.remove('invisible');
        document.getElementById(menuId)!.style.left = '0px';
      }

      document.getElementsByClassName('main-container')[0].classList.add('col-sm-9');

      if (!rightIfTrue) {
        document.getElementsByClassName('main-container')[0].classList.add('offset-sm-3');
      }
      MenusState.openMenu = menuId;
      MenusState.openMenuSide = rightIfTrue;
      callback(true);
    }
  },

  openMenu: '',

  openMenuSide: null

};
