/* @flow */
import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import IconButton from './IconButton';
import ButtonGroup from './ButtonGroup';

import filteredClassnames from '../lib/filteredClasnames';

export default class InputPopover extends Component {
  
  componentDidMount() {
    document.addEventListener('click', this._onDocumentClick);
    document.addEventListener('keydown', this._onDocumentKeydown);
    if (this._inputRef) {
      this._inputRef.focus();
    }
  }

  componentWillUnmount() {
    document.removeEventListener('click', this._onDocumentClick);
    document.removeEventListener('keydown', this._onDocumentKeydown);
  }

  render() {
    let {props} = this;
    return (
      <div className={filteredClassnames(['rte-input-popover', props.className])}>
        <div className={"inner"}>
          <input
            ref={this._setInputRef}
            defaultValue={props.defaultValue}
            type="text"
            placeholder="https://example.com/"
            className={"input"}
            onKeyPress={this._onInputKeyPress}
          />
          <ButtonGroup className={"buttonGroup"}>
            <IconButton
              label="Cancel"
              iconName="cancel"
              onClick={props.onCancel}
            />
            <IconButton
              label="Submit"
              iconName="accept"
              onClick={this._onSubmit}
            />
          </ButtonGroup>
        </div>
      </div>
    );
  }

  _setInputRef = (inputElement) =>
  {
    this._inputRef = inputElement;
  }

  _onInputKeyPress = (event) =>
  {
    if (event.which === 13) {
      // Avoid submitting a <form> somewhere up the element tree.
      event.preventDefault();
      this._onSubmit();
    }
  }

  _onSubmit = () =>
  {
    let value = this._inputRef ? this._inputRef.value : '';
    this.props.onSubmit(value);
  }

  _onDocumentClick = (event) =>
  {
    let rootNode = ReactDOM.findDOMNode(this);
    if (!rootNode.contains(event.target)) {
      // Here we pass the event so the parent can manage focus.
      this.props.onCancel(event);
    }
  }

  _onDocumentKeydown = (event) =>
  {
    if (event.keyCode === 27) {
      this.props.onCancel();
    }
  }
}
