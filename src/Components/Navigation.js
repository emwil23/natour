import React from 'react';

const Navigation = () => {
  return (
    <div className='navigation'>
      <input
        type='checkbox'
        className='navigation__checkbox'
        id='navi-toggle'
      />
      <label className='navigation__button' for='navi-toggle'>
        <span className='navigation__icon'>&nbsp;</span>
      </label>
      <div className='navigation__background'>&nbsp;</div>
      <nav className='navigation__nav'>
        <ul className='navigation__list'>
          <li className='navigation__item'>
            <a className='navigation__link' href='#'>
              <span>01</span>
              About Natours
            </a>
          </li>
          <li className='navigation__item'>
            <a className='navigation__link' href='#'>
              <span>02</span>
              Your Benefits
            </a>
          </li>
          <li className='navigation__item'>
            <a className='navigation__link' href='#'>
              <span>03</span>
              Popular tours
            </a>
          </li>
          <li className='navigation__item'>
            <a className='navigation__link' href='#'>
              <span>04</span>
              Story
            </a>
          </li>
          <li className='navigation__item'>
            <a className='navigation__link' href='#'>
              <span>05</span>
              Book Now
            </a>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Navigation;
