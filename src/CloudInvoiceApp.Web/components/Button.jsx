import React from 'react';

const Button = ({ children, ...props }) => (
  <button
    {...props}
    className="bg-blue-500 text-white hover:bg-blue-700 px-4 py-2 rounded" // using updated primary colors
  >
    {children}
  </button>
);

export default Button;
