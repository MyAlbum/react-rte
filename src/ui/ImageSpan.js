/* @flow */

import React, {Component} from 'react';
import {Entity} from 'draft-js';

import filteredClassnames from '../lib/filteredClasnames';

export default class ImageSpan extends Component {
  constructor(props) {
    super(props);
    
    const entity = props.contentState.getEntity(props.entityKey);
    const {width, height} = entity.getData();
    this.state = {
      width,
      height,
    };
  }

  componentDidMount() {
    const {width, height} = this.state;
    const entity = this.props.contentState.getEntity(this.props.entityKey);
    const image = new Image();
    const {src} = entity.getData();
    image.src = src;
    image.onload = () => {
      if (width == null || height == null) {
        
        this.setState({width: image.width, height: image.height});
        Entity.mergeData(
          this.props.entityKey,
          {
            width: image.width,
            height: image.height,
            originalWidth: image.width,
            originalHeight: image.height,
          }
        );
      }
    };
  }

  render() {
    const {width, height} = this.state;
    const entity = this.props.contentState.getEntity(this.props.entityKey);
    const {src} = entity.getData();

    const imageStyle = {
      verticalAlign: 'bottom',
      backgroundImage: `url("${src}")`,
      backgroundSize: `${width}px ${height}px`,
      lineHeight: `${height}px`,
      fontSize: `${height}px`,
      width,
      height,
      letterSpacing: width,
    };

    return (
      <span
        className={filteredClassnames(["rte-image-span", this.props.className])}
        style={imageStyle}
      >
        {this.props.children}
      </span>
    );
  }
}
