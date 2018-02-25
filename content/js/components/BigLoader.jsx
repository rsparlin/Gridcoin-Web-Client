import React from 'react';
import { Loader } from 'semantic-ui-react';

export default function BigLoader() {
  return (
    <div style={{ height: '100%', position: 'relative' }}>
      <Loader active size="massive" />
    </div>
  );
}
