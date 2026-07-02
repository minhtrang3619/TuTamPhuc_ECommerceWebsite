declare module 'react-quill' {
  import React from 'react';
  
  export interface QuillOptions {
    theme?: string;
    modules?: Record<string, any>;
    formats?: string[];
    bounds?: string | HTMLElement;
    scrollingContainer?: string | HTMLElement;
    readOnly?: boolean;
    placeholder?: string;
    tabIndex?: number;
    value?: string;
    defaultValue?: string;
    onChange?: (content: string, delta: any, source: any, editor: any) => void;
    onChangeSelection?: (selection: any, source: any, editor: any) => void;
    onFocus?: (selection: any, source: any, editor: any) => void;
    onBlur?: (previousSelection: any, source: any, editor: any) => void;
    onKeyDown?: React.EventHandler<any>;
    onKeyPress?: React.EventHandler<any>;
    onKeyUp?: React.EventHandler<any>;
    className?: string;
  }

  export default class ReactQuill extends React.Component<QuillOptions> {}
}
