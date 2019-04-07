# ember-intellisense

Basic autocompletion for 'ember' projects 

**(Requires vs code 1.33 and above)**

## Features

- Goto definition for components.
- Autocompletion of variables in component handlebars.
- Autocompletion of component path in handlebars.

## Installation

Install it from here ( https://marketplace.visualstudio.com/items?itemName=gokulprabhudroid.ember-intellisense )

## Developement

#### Installation from source
checkout repo and execute 

```
npm install
npm install -g vsce
sh install.sh
```
 in rootfolder (make sure you have all permissions).


## Todos
- Implement using AST instead of regex if possible.
- Explore language server.
