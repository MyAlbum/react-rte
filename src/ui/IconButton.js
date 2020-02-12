/* @flow */

import React, {Component} from 'react';
import Button from './Button';
import ButtonWrap from './ButtonWrap';

import './IconButton.scss';
import filteredClassnames from '../lib/filteredClasnames';


export default class IconButton extends Component {

  render() {
    let {props} = this;
    let {className, iconName, label, children, isActive, ...otherProps} = props;

    const classes = ["rte-icon-button"];
    if(isActive)
      classes.push("isActive")

    return (
      <ButtonWrap>
        <Button {...otherProps} title={label} className={filteredClassnames(classes)}>
          <span className={filteredClassnames(['icon', 'icon-' + iconName])} />
        </Button>
        {children}
      </ButtonWrap>
    );
  }
}
