import './sass/style.scss';
import React from 'react';

import Header from './Header';
import GridTest from './GridTest';
import Main from './Main';
import Tours from './Tours';
import Stories from './Stories';
import Book from './Book';
import Footer from './Footer';
import Navigation from './Navigation';
//import Popup from './Popup';

const App = () => {
  return (
    <React.Fragment>
      <Navigation />
      <Header />
      <Main />
      <Tours />
      <Stories />
      <Book />
      <Footer />
    </React.Fragment>
  );
};

export default App;
