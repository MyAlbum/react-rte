/* @flow */
import {EditorState, convertToRaw, convertFromRaw} from 'draft-js';
import {stateToHTML} from '@myalbum/draft-js-export-html';
import {stateFromHTML} from '@myalbum/draft-js-import-html';
import {stateToMarkdown} from '@myalbum/draft-js-export-markdown';
import {stateFromMarkdown} from '@myalbum/draft-js-import-markdown';

export default class EditorValue {
  constructor(editorState, cache = {}) {
    this._cache = cache;
    this._editorState = editorState;
  }

  getEditorState() {
    return this._editorState;
  }

  setEditorState(editorState) {
    return (this._editorState === editorState) ?
      this :
      new EditorValue(editorState);
  }

  toString(format, options) {
    let fromCache = this._cache[format];
    if (fromCache != null) {
      return fromCache;
    }

    return (this._cache[format] = toString(this.getEditorState(), format, options));
  }

  setContentFromString(markup, format, options) {
    let editorState = EditorState.push(
      this._editorState,
      fromString(markup, format, options),
      'secondary-paste'
    );
    return new EditorValue(editorState, {[format]: markup});
  }

  static createEmpty(decorator) {
    let editorState = EditorState.createEmpty(decorator);
    return new EditorValue(editorState);
  }

  static createFromState(editorState) {
    return new EditorValue(editorState);
  }

  static createFromString(markup, format, decorator, options) {
    let contentState = fromString(markup, format, options);
    let editorState = EditorState.createWithContent(contentState, decorator);
    return new EditorValue(editorState, {[format]: markup});
  }
}

function toString(editorState, format, options) {
  let contentState = editorState.getCurrentContent();
  switch (format) {
    case 'html': {
      return stateToHTML(contentState, options);
    }
    case 'markdown': {
      return stateToMarkdown(contentState);
    }
    case 'raw': {
      return JSON.stringify(convertToRaw(contentState));
    }
    default: {
      throw new Error('Format not supported: ' + format);
    }
  }
}

function fromString(markup, format, options) {
  switch (format) {
    case 'html': {
      return stateFromHTML(markup, options);
    }
    case 'markdown': {
      return stateFromMarkdown(markup, options);
    }
    case 'raw': {
      return convertFromRaw(JSON.parse(markup));
    }
    default: {
      throw new Error('Format not supported: ' + format);
    }
  }
}
