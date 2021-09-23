import React from 'react';

const Book = () => {
  return (
    <section className='section-book'>
      <div className='row'>
        <div className='book'>
          <div className='book__form'>
            <form action='#' className='form'>
              <div className=' u-margin-bottom-medium'>
                <h2 className='heading-secondary'>START BOOKING NOW</h2>
              </div>
              <div className='form__group'>
                <input
                  type='text'
                  className='form__input'
                  placeholder='Full Name'
                  id='name'
                  required={true}
                />
                <label for='name' className='form__label'>
                  Full Name
                </label>
              </div>
              <div className='form__group'>
                <input
                  type='email'
                  className='form__input'
                  placeholder='email address'
                  id='email'
                  required={true}
                />
                <label for='email' className='form__label'>
                  Email Address
                </label>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Book;
