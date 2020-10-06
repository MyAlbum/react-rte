/* @flow */

import React from 'react';

import filteredClassnames from '../lib/filteredClasnames';

export default function ButtonGroup(props) {
  return (
    <div {...props} className={filteredClassnames(["rte-button-group", props.className])} />
  );
}
