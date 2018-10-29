[![Codacy Badge](https://api.codacy.com/project/badge/Grade/9e20bb0ed58640379d4d9ebd2a0e168f)](https://www.codacy.com/app/Websecurify/babel-plugin-import-md-to-js?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=websecurify/babel-plugin-import-md-to-js&amp;utm_campaign=Badge_Grade)
[![Follow on Twitter](https://img.shields.io/twitter/follow/websecurify.svg?logo=twitter)](https://twitter.com/websecurify)

# babel-plugin-import-md-to-js

This is a simple babel plugin to inline markdown into js via marked and js-yaml.

This plugin is very much experimental due to use of the Babel6 API - largely undocumented. Contributions are welcome.

## Usage

The following command will convert everything in the `src` folder to `lib` using babel and our plugin.

    babel src/ -d lib/ --presets stage-0,es2015,react --plugins import-md-to-js

Every js file that has a statement such as:

```javascript
import page from './page.md'
```

will be roughtly translated to:

```javascript
var page = {
    ...metadata
    contents: `...` // the md file without the metadata converted to html
}
```

You can also import markdown pages raw by placing the ! symbol at the end of the file. For example:

```javascript
import page from './page.md!'
```

will be roughtly translated to:

```javascript
var page = {
    ...metadata
    contents: `...` // the md file without the metadata
}
```

Notice that in both examples we split the metadata. This is done via the js-yaml module. Consider the following page:

```markdown
---
a: 1
b: 2
---

# Hello
```

will be translated to:

```javascript
var page = {
    a: 1,
    b: 2
    contents: `<h1>Hello</h1>`
}
```

## Use Cases

The only use case of this plugin is to be able to bundle markdown pages with your js components. It is good for portability.
