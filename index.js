var fs = require('fs')
var path = require('path')
var marked = require('marked')
var jsYaml = require('js-yaml')
var requireResolve = require('require-resolve')

function mdToJs(md, convert) {
    var props = {}
    var contents = md

    if (md.slice(0, 4) === '---\n') {
        var index = md.indexOf('---\n', 5)

        if (index > 0) {
            var yamlString = md.slice(0, index).substring(4)

            props = jsYaml.safeLoad(yamlString)

            contents = md.substring(index + 4)
        }
    }

    if (convert) {
        contents = marked(contents)
    }

    return Object.assign({}, props, {contents: contents})
}

function toTree(t, obj) {
    var props = []

    for (var key in obj) {
        var val = obj[key]

        if (val === null) {
            val = t.nullLiteral()
        } else {
            var type = typeof(val)

            if (type ===  'undefined') {
                continue
            }

            switch(type) {
                case 'string':
                    val = t.stringLiteral(val)

                    break

                case 'number':
                    val = t.numericLiteral(val)

                    break

                case 'boolean':
                    val = t.booleanLiteral(val)

                    break

                default:
                    val = toTree(t, val)
            }
        }

        props.push(t.objectProperty(t.stringLiteral(key), val))
    }

    return t.objectExpression(props)
}

module.exports = function (babel) {
    var t = babel.types

    return {
        visitor: {
            ImportDeclaration: {
                // pretty much guessing what input paramters are called

                exit: function(decl, file) {
                    var node = decl.node

                    var pathname = node.source.value

                    if (pathname.endsWith('.md')) {
                        // everything you see here is a complete guesswork but
                        // that is what you get without proper documentation -
                        // #babel6

                        var mod = requireResolve(pathname, path.resolve(file.file.opts.filename))
                        var id = t.identifier(node.specifiers[0].local.name)
                        var value = toTree(t, mdToJs(fs.readFileSync(mod.src).toString(), true)) // due to bugs we cannot use t.valueToNode

                        decl.replaceWith(t.variableDeclaration('var', [t.variableDeclarator(id, value)]))
                    } else
                    if (pathname.endsWith('.md!')) {
                        // everything you see here is a complete guesswork but
                        // that is what you get without proper documentation -
                        // #babel6

                        pathname = pathname.slice(0, -1)

                        var mod = requireResolve(pathname, path.resolve(file.file.opts.filename))
                        var id = t.identifier(node.specifiers[0].local.name)
                        var value = toTree(t, mdToJs(fs.readFileSync(mod.src).toString(), false)) // due to bugs we cannot use t.valueToNode

                        decl.replaceWith(t.variableDeclaration('var', [t.variableDeclarator(id, value)]))
                    }
                }
            }
        }
    }
}
