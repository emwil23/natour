import './sass/style.scss';
import React from 'react';

import Header from './Header';
import GridTest from './GridTest';
import Main from './Main';
import Tours from './Tours';
import Stories from './Stories';
import Book from './Book';

const App = () => {
  return (
    <React.Fragment>
      <Header />
      <Main />
      <Tours />
      <Stories />
      <Book />
    </React.Fragment>
  );
};

export default App;
