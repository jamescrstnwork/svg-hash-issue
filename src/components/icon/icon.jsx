import React from 'react';

const Icon = ({ type, className = '', size = 'md', onClick=()=>{}, ...restProps }) => {
  const icn = require(`../../../assets/icons/${type}.svg`).default;
  return (
    <svg
      onClick={onClick}
      className={`am-icon am-icon-${type} am-icon-${size} ${className}`}
      {...restProps}
    >
      <use xlinkHref={icn.url} />
    </svg>
  );
};


export default Icon;

