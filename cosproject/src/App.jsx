import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useSpring, animated } from 'react-spring';
import Header from './Header';

function App() {
  const [flip, setFlip] = useState(false);
  const location = useLocation();

  const props = useSpring({
    to: { opacity: 1 },
    from: { opacity: 0 },
    reset: true,
    reverse: flip,
    delay: 0,
    onRest: () => setFlip(flip),
  });

  return (
    <div className="min-h-screen">
      <animated.div style={props}  className="bg-red-900">
      <Header /> {/* Header is visible on all pages */}
        <div className="w-full min-h-full">
          {/* Background applied through react-spring */}
          <Outlet /> {/* Renders child routes like Login, Dashboard, etc. */}
        </div>
      </animated.div>
    </div>
  );
}

export default App;