import React from 'react';

export default function Button({ children, className = '', ...props }) {
  return (
    <button className={`px-3 py-2 rounded bg-teal-600 text-white ${className}`} {...props}>
      {children}
    </button>
  );
}
