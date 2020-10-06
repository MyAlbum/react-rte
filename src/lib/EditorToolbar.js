/* @flow */
import {hasCommandModifier} from 'draft-js/lib/KeyBindingUtil';

import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import {EditorState, RichUtils, Modifier} from 'draft-js';
import {ENTITY_TYPE} from 'draft-js-utils';
import DefaultToolbarConfig from './EditorToolbarConfig';
import StyleButton from './StyleButton';
import PopoverIconButton from '../ui/PopoverIconButton';
import ButtonGroup from '../ui/ButtonGroup';
import Dropdown from '../ui/Dropdown';
import IconButton from '../ui/IconButton';
import getEntityAtCursor from './getEntityAtCursor';
import clearEntityForRange from './clearEntityForRange';
import autobind from 'class-autobind';
import filteredClassnames from './filteredClasnames';

export default class EditorToolbar extends Component {
  constructor() {
    super(...arguments);
    autobind(this);
    this.state = {
      showLinkInput: false,
      showImageInput: false,
      customControlState: {},
    };
  }

  componentDidMount() {
    // Technically, we should also attach/detach event listeners when the
    // `keyEmitter` prop changes.
    this.props.keyEmitter.on('keypress', this._onKeypress);
  }

  componentWillUnmount() {
    this.props.keyEmitter.removeListener('keypress', this._onKeypress);
  }

  render() {
    let {className, toolbarConfig, rootStyle, isOnBottom} = this.props;
    if (toolbarConfig == null) {
      toolbarConfig = DefaultToolbarConfig;
    }
    let display = toolbarConfig.display || DefaultToolbarConfig.display;
    let buttonGroups = display.map((groupName) => {
      switch (groupName) {
        case 'INLINE_STYLE_BUTTONS': {
          return this._renderInlineStyleButtons(groupName, toolbarConfig);
        }
        case 'BLOCK_TYPE_DROPDOWN': {
          return this._renderBlockTypeDropdown(groupName, toolbarConfig);
        }
        case 'LINK_BUTTONS': {
          return this._renderLinkButtons(groupName, toolbarConfig);
        }
        case 'IMAGE_BUTTON': {
          return this._renderImageButton(groupName, toolbarConfig);
        }
        case 'BLOCK_TYPE_BUTTONS': {
          return this._renderBlockTypeButtons(groupName, toolbarConfig);
        }
        case 'HISTORY_BUTTONS': {
          return this._renderUndoRedo(groupName, toolbarConfig);
        }
      }
    });

    const classes = ["rte-toolbar", className];
    if(isOnBottom)
      classes.push("onBottom");
    
    return (
      <div className={filteredClassnames(classes)} style={rootStyle}>
        {buttonGroups}
        {this._renderCustomControls()}
      </div>
    );
  }

  _renderCustomControls() {
    let {customControls, editorState} = this.props;
    if (customControls == null) {
      return;
    }
    return customControls.map((f) => {
      switch (typeof f) {
        case 'function': {
          return f(
            this._setCustomControlState,
            this._getCustomControlState,
            editorState
          );
        }
        default: {
          return f;
        }
      }
    });
  }

  _setCustomControlState(key, value) {
    this.setState(({customControlState}) => ({
      customControlState: {...customControlState, [key]: value},
    }));
  }

  _getCustomControlState(key) {
    return this.state.customControlState[key];
  }

  _renderBlockTypeDropdown(name, toolbarConfig) {
    let blockType = this._getCurrentBlockType();
    let choices = new Map(
      (toolbarConfig.BLOCK_TYPE_DROPDOWN || []).map((type) => [type.style, {label: type.label, className: type.className}])
    );
    if (!choices.has(blockType)) {
      blockType = Array.from(choices.keys())[0];
    }
    return (
      <ButtonGroup key={name}>
        <Dropdown
          {...toolbarConfig.extraProps}
          choices={choices}
          selectedKey={blockType}
          onChange={this._selectBlockType}
        />
      </ButtonGroup>
    );
  }

  _renderBlockTypeButtons(name, toolbarConfig) {
    let blockType = this._getCurrentBlockType();
    let buttons = (toolbarConfig.BLOCK_TYPE_BUTTONS || []).map((type, index) => (
      <StyleButton
        {...toolbarConfig.extraProps}
        key={String(index)}
        isDisabled={blockType.indexOf('header')>-1}
        isActive={type.style === blockType}
        label={type.label}
        onToggle={this._toggleBlockType}
        style={type.style}
        className={type.className}
      />
    ));
    return (
      <ButtonGroup key={name}>{buttons}</ButtonGroup>
    );
  }

  _renderInlineStyleButtons(name, toolbarConfig) {
    let blockType = this._getCurrentBlockType();
    let {editorState} = this.props;
    let currentStyle = editorState.getCurrentInlineStyle();
    let buttons = (toolbarConfig.INLINE_STYLE_BUTTONS || []).map((type, index) => (
      <StyleButton
        {...toolbarConfig.extraProps}
        key={String(index)}
        isDisabled={blockType.indexOf('header')>-1}
        isActive={currentStyle.has(type.style)}
        label={type.label}
        onToggle={this._toggleInlineStyle}
        style={type.style}
        className={type.className}
      />
    ));
    return (
      <ButtonGroup key={name}>{buttons}</ButtonGroup>
    );
  }

  _renderLinkButtons(name, toolbarConfig) {
    let {editorState} = this.props;
    let selection = editorState.getSelection();
    let entity = this._getEntityAtCursor();
    let hasSelection = !selection.isCollapsed();
    let isCursorOnLink = (entity != null && entity.type === ENTITY_TYPE.LINK);
    let shouldShowLinkButton = hasSelection || isCursorOnLink;
    let defaultValue = (entity && isCursorOnLink) ? entity.getData().url : '';
    const config = toolbarConfig.LINK_BUTTONS || {};
    const linkConfig = config.link || {};
    const removeLinkConfig = config.removeLink || {};
    const linkLabel = linkConfig.label || 'Link';
    const removeLinkLabel = removeLinkConfig.label || 'Remove Link';

    return (
      <ButtonGroup key={name}>
        <PopoverIconButton
          label={linkLabel}
          iconName="link"
          isDisabled={!shouldShowLinkButton}
          showPopover={this.state.showLinkInput}
          onTogglePopover={this._toggleShowLinkInput}
          defaultValue={defaultValue}
          onSubmit={this._setLink}
        />
        <IconButton
          {...toolbarConfig.extraProps}
          label={removeLinkLabel}
          iconName="remove-link"
          isDisabled={!isCursorOnLink}
          onClick={this._removeLink}
          focusOnClick={false}
        />
      </ButtonGroup>
    );
  }

  _renderImageButton(name, toolbarConfig) {
    const config = (toolbarConfig.IMAGE_BUTTON || {});
    const label = config.label || 'Image';
    return (
      <ButtonGroup key={name}>
        <PopoverIconButton
          label={label}
          iconName="image"
          showPopover={this.state.showImageInput}
          onTogglePopover={this._toggleShowImageInput}
          onSubmit={this._setImage}
        />
      </ButtonGroup>
    );
  }

  _renderUndoRedo(name, toolbarConfig) {
    let {editorState} = this.props;
    let canUndo = editorState.getUndoStack().size !== 0;
    let canRedo = editorState.getRedoStack().size !== 0;
    const config = toolbarConfig.HISTORY_BUTTONS || {};
    const undoConfig = config.undo || {};
    const redoConfig = config.redo || {};
    const undoLabel = undoConfig.label || 'Undo';
    const redoLabel = redoConfig.label || 'Redo';
    return (
      <ButtonGroup key={name}>
        <IconButton
          {...toolbarConfig.extraProps}
          label={undoLabel}
          iconName="undo"
          isDisabled={!canUndo}
          onClick={this._undo}
          focusOnClick={false}
        />
        <IconButton
          {...toolbarConfig.extraProps}
          label={redoLabel}
          iconName="redo"
          isDisabled={!canRedo}
          onClick={this._redo}
          focusOnClick={false}
        />
      </ButtonGroup>
    );
  }

  _onKeypress(event, eventFlags) {
    // Catch cmd+k for use with link insertion.
    if (hasCommandModifier(event) && event.keyCode === 75) {
      let {editorState} = this.props;
      if (!editorState.getSelection().isCollapsed()) {
        this.setState({showLinkInput: true});
        eventFlags.wasHandled = true;
      }
    }
  }

  _toggleShowLinkInput(event) {
    let isShowing = this.state.showLinkInput;
    // If this is a hide request, decide if we should focus the editor.
    if (isShowing) {
      let shouldFocusEditor = true;
      if (event && event.type === 'click') {
        // TODO: Use a better way to get the editor root node.
        let editorRoot = ReactDOM.findDOMNode(this).parentNode;
        let {activeElement} = document;
        let wasClickAway = (activeElement == null || activeElement === document.body);
        if (!wasClickAway && !editorRoot.contains(activeElement)) {
          shouldFocusEditor = false;
        }
      }
      if (shouldFocusEditor) {
        this.props.focusEditor();
      }
    }
    this.setState({showLinkInput: !isShowing});
  }

  _toggleShowImageInput(event) {
    let isShowing = this.state.showImageInput;
    // If this is a hide request, decide if we should focus the editor.
    if (isShowing) {
      let shouldFocusEditor = true;
      if (event && event.type === 'click') {
        // TODO: Use a better way to get the editor root node.
        let editorRoot = ReactDOM.findDOMNode(this).parentNode;
        let {activeElement} = document;
        let wasClickAway = (activeElement == null || activeElement === document.body);
        if (!wasClickAway && !editorRoot.contains(activeElement)) {
          shouldFocusEditor = false;
        }
      }
      if (shouldFocusEditor) {
        this.props.focusEditor();
      }
    }
    this.setState({showImageInput: !isShowing});
  }

  _setImage(src) {
    let {editorState} = this.props;
    let contentState = editorState.getCurrentContent();
    let selection = editorState.getSelection();
    contentState = contentState.createEntity(ENTITY_TYPE.IMAGE, 'IMMUTABLE', {src});
    let entityKey = contentState.getLastCreatedEntityKey();
    let newContentState = Modifier.insertText(contentState, selection, ' ', null, entityKey);
    this.setState({showImageInput: false});
    this.props.onChange(
      EditorState.push(editorState, newContentState)
    );
    this._focusEditor();
  }

  _setLink(url) {
    let {editorState} = this.props;
    let contentState = editorState.getCurrentContent();
    let selection = editorState.getSelection();
    let origSelection = selection;
    let canApplyLink = false;

    if (selection.isCollapsed()) {
      let entity = this._getEntityDescriptionAtCursor();
      if (entity) {
        canApplyLink = true;
        selection = selection.merge({
          anchorOffset: entity.startOffset,
          focusOffset: entity.endOffset,
          isBackward: false,
        });
      }
    } else {
      canApplyLink = true;
    }

    this.setState({showLinkInput: false});
    if (canApplyLink) {
      contentState = contentState.createEntity(ENTITY_TYPE.LINK, 'MUTABLE', {url});
      let entityKey = contentState.getLastCreatedEntityKey();

      editorState = EditorState.push(editorState, contentState);
      editorState = RichUtils.toggleLink(editorState, selection, entityKey);
      editorState = EditorState.acceptSelection(editorState, origSelection);

      this.props.onChange(editorState);
    }
    this._focusEditor();
  }

  _removeLink() {
    let {editorState} = this.props;
    let entity = getEntityAtCursor(editorState);
    if (entity != null) {
      let {blockKey, startOffset, endOffset} = entity;
      this.props.onChange(
        clearEntityForRange(editorState, blockKey, startOffset, endOffset)
      );
    }
  }

  _getEntityDescriptionAtCursor() {
    let {editorState} = this.props;
    return getEntityAtCursor(editorState);
  }

  _getEntityAtCursor() {
    let {editorState} = this.props;
    let contentState = editorState.getCurrentContent();
    let entity = getEntityAtCursor(editorState);
    return (entity == null) ? null : contentState.getEntity(entity.entityKey);
  }

  _getCurrentBlockType() {
    let {editorState} = this.props;
    let selection = editorState.getSelection();
    return editorState
      .getCurrentContent()
      .getBlockForKey(selection.getStartKey())
      .getType();
  }

  _selectBlockType() {
    this._toggleBlockType(...arguments);
    this._focusEditor();
  }

  _toggleBlockType(blockType) {
    this.props.onChange(
      RichUtils.toggleBlockType(
        this.props.editorState,
        blockType
      )
    );
  }

  _toggleInlineStyle(inlineStyle) {
    this.props.onChange(
      RichUtils.toggleInlineStyle(
        this.props.editorState,
        inlineStyle
      )
    );
  }

  _undo() {
    let {editorState} = this.props;
    this.props.onChange(
      EditorState.undo(editorState)
    );
  }

  _redo() {
    let {editorState} = this.props;
    this.props.onChange(
      EditorState.redo(editorState)
    );
  }

  _focusEditor() {
    // Hacky: Wait to focus the editor so we don't lose selection.
    setTimeout(() => {
      this.props.focusEditor();
    }, 50);
  }
}
