# ember-intellisense

Basic autocompletion for 'ember' projects 

**(Requires vs code 1.33 and above)**

## Features

##### Goto definition for components 
![demo](demos/goto-def.gif).


##### Autocompletion of variables in component handlebars 
![demo](demos/attrib-completion.gif).

##### Autocompletion of component path in handlebars 
![demo](demos/path-completion.gif).

##### Autocompletion of model attributes 
![demo](demos/model-completion.gif).


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
