import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';

function App() {
  return (
    <div>
      <Header /> {/* This will show the Header on all pages */}
      <Outlet /> {/* Renders child routes like Login, Dashboard, etc. */}
    </div>
  );
}

export default App;
