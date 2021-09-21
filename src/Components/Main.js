import React from 'react';
//import './sass/style.scss';
import photo1 from '../img/nat-1-large.jpg';
import photo2 from '../img/nat-2-large.jpg';
import photo3 from '../img/nat-3-large.jpg';
import {
  AiOutlineGlobal,
  AiOutlineCompass,
  AiOutlineHome,
  AiOutlineHeart,
} from 'react-icons/ai';

const Main = () => {
  return (
    <main>
      <script src='https://unpkg.com/feather-icons'></script>

      <section className='section-about'>
        <div className='u-center-text u-margin-bottom-big'>
          <h2 className='heading-secondary'>
            Exciting tours for adventrous people
          </h2>
        </div>

        <div className='row'>
          <div className='col-1-of-2'>
            <h3 className='heading-tertiary u-margin-bottom-small'>
              You're going to fall in love with nature
            </h3>
            <p className='paragraph'>
              Lorem Ipsum is simply dummy text of the printing and typesetting
              industry. Lorem Ipsum has been the industry's standard dummy text
              ever since the 1500s, when an unknown printer took a galley of
              type and scrambled it to make a type specimen book.
            </p>
            <h3 className='heading-tertiary u-margin-bottom-small'>
              Live adventures like you haven't had before
            </h3>
            <p className='paragraph'>
              Lorem Ipsum is simply dummy text of the printing and typesetting
              industry. Lorem Ipsum has been the industry's standard dummy text
              ever since the 1500s.
            </p>
            <a href='#' className='btn-text'>
              Learn More &rarr;
            </a>
          </div>
          <div className='col-1-of-2'>
            <div className='composition'>
              <img
                src={photo1}
                alt='nature-1'
                className='composition__photo composition__photo--p1'
              />
              <img
                src={photo2}
                alt='nature-2'
                className='composition__photo composition__photo--p2'
              />
              <img
                src={photo3}
                alt='nature-3'
                className='composition__photo composition__photo--p3'
              />
            </div>
          </div>
        </div>
      </section>
      <section className='section-features'>
        <div className='row'>
          <div className='col-1-of-4'>
            <div className='feature-box'>
              <i className='feature-box__icon'>
                <AiOutlineGlobal />
              </i>
              <h3 className='heading-tertiary u-margin-bottom-small'>
                Explore the world
              </h3>
              <p className='feature-box__text'>
                Lorem Ipsum is simply dummy text of the printing and typesetting
                industry. Lorem Ipsum has been the industry's standard.
              </p>
            </div>
          </div>
          <div className='col-1-of-4'>
            <div className='feature-box'>
              <i className='feature-box__icon'>
                <AiOutlineCompass />
              </i>
              <h3 className='heading-tertiary u-margin-bottom-small'>
                Meet Nature
              </h3>
              <p className='feature-box__text'>
                Lorem Ipsum is simply dummy text of the printing and typesetting
                industry. Lorem Ipsum has been the industry's standard.
              </p>
            </div>
          </div>
          <div className='col-1-of-4'>
            <div className='feature-box'>
              <i className='feature-box__icon'>
                <AiOutlineHome />
              </i>
              <h3 className='heading-tertiary u-margin-bottom-small'>
                Find your way
              </h3>
              <p className='feature-box__text'>
                Lorem Ipsum is simply dummy text of the printing and typesetting
                industry. Lorem Ipsum has been the industry's standard.
              </p>
            </div>
          </div>
          <div className='col-1-of-4'>
            <div className='feature-box'>
              <i className='feature-box__icon'>
                <AiOutlineHeart />
              </i>
              <h3 className='heading-tertiary u-margin-bottom-small'>
                Live a healthier life
              </h3>
              <p className='feature-box__text'>
                Lorem Ipsum is simply dummy text of the printing and typesetting
                industry. Lorem Ipsum has been the industry's standard.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Main;
