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
                  autoComplete={false}
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
                  autoComplete={false}
                />
                <label for='email' className='form__label'>
                  Email Address
                </label>
              </div>
              <div className='form__group u-margin-bottom-medium'>
                <div className='form__radio-group'>
                  <input
                    type='radio'
                    className='form__radio-input'
                    id='small'
                    name='size'
                  />
                  <label for='small' className='form__radio-label'>
                    <span className='form__radio-button'></span>
                    Small tour group
                  </label>
                </div>
                <div className='form__radio-group'>
                  <input
                    type='radio'
                    className='form__radio-input'
                    id='large'
                    name='size'
                  />
                  <label for='large' className='form__radio-label'>
                    <span className='form__radio-button'></span>
                    Large tour group
                  </label>
                </div>
              </div>
              <div className='form__group'>
                <button className='btn btn--green'>Next Step &rarr;</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Book;
