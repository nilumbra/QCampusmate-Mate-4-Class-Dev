# Webpack Concepts

### Entry
Or entry point tells webpack which modules shoud be used to begin building out its dependency graph. 
 

## Modules
`.sass`, `.css`, `.vue`, `@import`, `url()`, 
Webpack sees all files with the above extensions and imports statements as direct or indirect modules of the current app being bundled.


### .s[ac]ss
```js
{
  test: /\.sass$$/,
  use: [
    //Creates `style` nodes from JS strings
    'vue-style-loader',
    //Translates CSS into CommonJS
    'css-loader',
    //Compiles Sass to CSS
    //https://github.com/webpack-contrib/sass-loader
    'sass-loader'] 
}
```
- css-loader: interprets @import and url() like import/require() and will resolve them.

## Plugins

### [**html-webpack-plugin**](https://github.com/jantimon/html-webpack-plugin)
The following config code will generate an `index.html` in the specified `output.path`.
```js
const HtmlWebpackPlugin = require('html-webpack-plugin');

// in plugins: []
new HtmlWebpackPlugin ({
  filename: 'index.html'
})
```

### [**vue-loader**](https://vue-loader.vuejs.org/#what-is-vue-loader)
What enables you to write in [Single-File Components (SFCs)](https://vue-loader.vuejs.org/spec.html) format.

- Static assets referenced in `<style>` and `<template>`are treated as module dependencies(i.e. the Webpack way). So they are handled to other corresponding webpack loaders for processing.