import React from 'react';
import footer from '../img/logo-green-2x.png';

const Footer = () => {
  return (
    <div className='footer'>
      <div className='footer__logo-box'>
        <img src={footer} alt='full logo' className='footer__logo' />
      </div>
      <div className='row'>
        <div className='col-1-of-2'>
          <div className='footer__navigation'>
            <ul className='footer__list'>
              <li className='footer__item'>
                <a href='#' className='footer__link'>
                  Company
                </a>
              </li>
              <li className='footer__item'>
                <a href='#' className='footer__link'>
                  Contact Us
                </a>
              </li>
              <li className='footer__item'>
                <a href='#' className='footer__link'>
                  Careers
                </a>
              </li>
              <li className='footer__item'>
                <a href='#' className='footer__link'>
                  Privacy
                </a>
              </li>
              <li className='footer__item'>
                <a href='#' className='footer__link'>
                  Terms
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className='col-1-of-2'>
          <p className='footer__copyright'>
            Bulit by &nbsp;&nbsp; {''}
            <a href='#' className='footer__link'>
              Emmanuel Wilson
            </a>
            &nbsp;
            &
            &nbsp;
            <a href='#' className='footer__link'>
              Tushar Kumar
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default Footer;
