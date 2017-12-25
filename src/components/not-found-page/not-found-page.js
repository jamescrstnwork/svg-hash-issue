import React from 'react';

// antd-mobile imports
import { Button } from 'antd-mobile';

import Styled from './style';

const NotFoundPage = () => {
  return (
    <Styled>
    <div className="normal">
      <div className="container">
        <h1 className="title">404</h1>
        <p className="desc">Page Not Found</p>
        <a href="/"><Button type="primary" style={{ marginTop: 5 }}>Home</Button></a>
      </div>
    </div>
    </Styled>
  );
};

export default NotFoundPage;
