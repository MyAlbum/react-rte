/* @flow */

import React from 'react';

import filteredClassnames from '../lib/filteredClasnames';

import './ButtonWrap.scss';


export default function ButtonWrap(props) {
  return <div {...props} className={filteredClassnames(["rte-button-wrap", props.className])} />;
}
