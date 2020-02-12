/* @flow */

import React, {Component} from 'react';

import filteredClassnames from '../lib/filteredClasnames';

import './Button.scss';

export default class Button extends Component {
  render()
  {
    let {props} = this;
    let {className, isDisabled, focusOnClick, formSubmit, ...otherProps} = props;
    
    let onMouseDown = (focusOnClick === false) ? this._onMouseDownPreventDefault : props.onMouseDown;
    let type = formSubmit ? 'submit' : 'button';
    return (
      <button type={type} {...otherProps} onMouseDown={onMouseDown} className={filteredClassnames(["rte-button", className])} disabled={isDisabled}>
        {props.children}
      </button>
    );
  }

  _onMouseDownPreventDefault = (event) =>
  {
    event.preventDefault();
    let {onMouseDown} = this.props;
    if (onMouseDown != null) {
      onMouseDown(event);
    }
  }
}
