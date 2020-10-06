/* @flow */
import React, {Component} from 'react';

import filteredClassnames from '../lib/filteredClasnames';

export default class Dropdown extends Component {
  constructor() {
    super(...arguments);
  }

  render() {
    let {choices, selectedKey, className, ...otherProps} = this.props;
    className = filteredClassnames(["rte-dropdown", className]);
    let selectedItem = (selectedKey == null) ? null : choices.get(selectedKey);
    let selectedValue = selectedItem && selectedItem.label || '';
    return (
      <span className={className} title={selectedValue}>
        <select {...otherProps} value={selectedKey} onChange={this._onChange}>
          {this._renderChoices()}
        </select>
        <span className={"value"}>{selectedValue}</span>
      </span>
    );
  }

  _onChange = (event) =>
  {
    let value = event.target.value;
    this.props.onChange(value);
  }

  _renderChoices() {
    let {choices} = this.props;
    let entries = Array.from(choices.entries());
    return entries.map(([key, {label, className}]) => (
      <option key={key} value={key} className={className}>{label}</option>
    ));
  }
}
