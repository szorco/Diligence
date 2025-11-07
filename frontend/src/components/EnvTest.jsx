import React from 'react';

const EnvTest = () => {
  console.log('Environment Test Component Rendered');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('REACT_APP_ENV:', process.env.REACT_APP_ENV);
  
  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'red',
      color: 'white',
      padding: '10px',
      zIndex: 9999,
      border: '2px solid black',
      fontSize: '16px',
      fontWeight: 'bold'
    }}>
      ENV: {process.env.NODE_ENV}
    </div>
  );
};

export default EnvTest;
