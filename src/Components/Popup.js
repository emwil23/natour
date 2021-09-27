import React from 'react';
import nat8 from '../img/nat-8.jpg';
import nat9 from '../img/nat-9.jpg';

const Popup = () => {
  return (
    <div className='popup' id='popup'>
      <div className='popup__content'>
        <div className='popup__left'>
          <img src={nat8} alt='Tour Photo' className='popup__img' />
          <img src={nat9} alt='Tour Photo' className='popup__img' />
        </div>
        <div className='popup__right'>
          <a href='#section-tours' className='popup__close'>
            &times;
          </a>
          <h2 className='heading-secondary u-margin-bottom-small'>
            Start booking now
          </h2>
          <h3 className='heading-tertiary u-margin-bottom-small'>
            Important &ndash; Please read the terms before booking.
          </h3>

          <p className='popup__text'>
            Lorem ipsum dolor sit amet. Id odio rerum qui nobis praesentium et
            enim molestias qui aliquid ipsa. Et consequatur voluptatum dolorem
            ducimus qui laboriosam repellat est earum provident non dolorem
            distinctio aut omnis explicabo? Aut saepe nostrum ut explicabo
            ratione ex nisi galisum sed nisi voluptas! Non error quia sed
            eligendi quae rem minus reiciendis et assumenda ea optio ullam qui
            quia voluptate. Rem quia sapiente vel quibusdam tempore ea dolore
            voluptatum.
          </p>

          <a href='#section-tours' className='btn btn--green'>
            Book now
          </a>
        </div>
      </div>
    </div>
  );
};

export default Popup;
