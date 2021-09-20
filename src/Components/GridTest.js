import './sass/style.scss';
import React from 'react';

const GridTest = () => {
  return (
    <div className='grid-test'>
      <div className='row'>
        <div className='col-1-of-2'>Col 1 of 2</div>
        <div className='col-1-of-2'>Col 1 of 2</div>
      </div>
      <div className='row'>
        <div className='col-1-of-3'>Col 1 of 3</div>
        <div className='col-1-of-3'>Col 1 of 3</div>
        <div className='col-1-of-3'>Col 1 of 3</div>
      </div>
    </div>
  );
};

export default GridTest;
