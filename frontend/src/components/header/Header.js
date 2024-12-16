import React from 'react';
import MobileHeader from './MobileHeader';
import DesktopHeader from './DesktopHeader';
import { getNavLinkClass } from '../../utils/getNavLinkClass';

function Header() {
  return (
    <>
      <MobileHeader getNavLinkClass={getNavLinkClass} />
      <DesktopHeader getNavLinkClass={getNavLinkClass} />
    </>
  );
}

export default Header;
