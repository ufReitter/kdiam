import { NgxMonacoEditorConfig } from 'ngx-monaco-editor';
const MonacoConfig: NgxMonacoEditorConfig = {
  onMonacoLoad: function() {
    monaco.editor.defineTheme('appname', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.lineHighlightBackground': '#444444'
      }
    });
    monaco.editor.setTheme('appname');
  }
};

export default MonacoConfig;