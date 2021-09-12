import React from 'react';
import logo from '../img/logo-white.png';
import './styles.css';

const Header = () => {
  return (
    <div class='header'>
      <div class='logo-box'>
        <img src={logo} alt='logo' class='logo' />
      </div>

      <div class='text-box'>
        <h1 class='heading-primary'>
          <span class='heading-primary-main'>Outdoors</span>
          <span class='heading-primary-sub'>is where life happens</span>
        </h1>

        <a href='#' class='btn btn-white btn-animated'>
          Discover Our Tours
        </a>
      </div>
    </div>
  );
};
export default Header;
