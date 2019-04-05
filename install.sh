npm install -g vsce
rm ember-intellisense.vsix
vsce package -o ember-intellisense.vsix
code --install-extension ember-intellisense.vsix