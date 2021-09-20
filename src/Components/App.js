import './sass/style.scss';
import React from 'react';

import Header from './Header';
import GridTest from './GridTest';
import Main from './Main';

const App = () => {
  return (
    <React.Fragment>
      <Header />
      <Main />
    </React.Fragment>
  );
};

export default App;
