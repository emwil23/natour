import React from 'react';
import './sass/style.scss';

const Main = () => {
  return (
    <main>
      <section className='section-about'>
        <div className='u-center-text u-margin-bottom-8'>
          <h2 className='heading-secondary'>
            Exciting tours for adventrous people
          </h2>
        </div>

        <div className='row'>
          <div className='col-1-of-2'>Text Here</div>
          <div className='col-1-of-2'>Image Composition</div>
        </div>
      </section>
    </main>
  );
};

export default Main;
