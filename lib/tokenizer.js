const fs = require('fs-extra')

const K = require('./constants')

const controlTypeStrings = [
    { type: K.TOKEN_FOR,    string: 'for'     },
    { type: K.TOKEN_EFOR,   string: 'efor'    },
    { type: K.TOKEN_IF,     string: 'if'      },
    { type: K.TOKEN_ELSEIF, string: 'else if' },
    { type: K.TOKEN_ELSE,   string: 'else'    },
    { type: K.TOKEN_EIF,    string: 'eif'     },
]

function Tokenizer(input, options = {}, cb = () => {}) {
    function setDefaultOption(option, value) {
        if (typeof options[option] === 'undefined') {
            options[option] = value
        }
    }

    setDefaultOption('expressionStartTag', '[[')
    setDefaultOption('expressionEndTag',   ']]')
    setDefaultOption('controlStartTag',    '[!')
    setDefaultOption('controlEndTag',      '!]')
    setDefaultOption('includeStartTag',    '[@')
    setDefaultOption('includeEndTag',      '@]')

    let position = 0
    const inputLength = input.length
    let tokens = []
    getTokenRecursively()

    function getValue(type, nextPosition) {
        let start = position
        let end = nextPosition
        let shouldTrim = true
        switch (type) {
            case K.TOKEN_PLAIN: {
                shouldTrim = false
                break
            }
            case K.TOKEN_EXPRESSION: {
                start += options.expressionStartTag.length
                end -= options.expressionEndTag.length
                break
            }
            case K.TOKEN_FOR: {
                start += options.controlStartTag.length
                start = input.indexOf('for ', start) + 4
                end -= options.controlEndTag.length
                break
            }
            case K.TOKEN_IF: {
                start += options.controlStartTag.length
                start = input.indexOf('if ', start) + 3
                end -= options.controlEndTag.length
                break
            }
            case K.TOKEN_ELSEIF: {
                start += options.controlStartTag.length
                start = input.indexOf('else if ', start) + 7
                end -= options.controlEndTag.length
                break
            }
            case K.TOKEN_INCLUDE: {
                start += options.includeStartTag.length
                end -= options.includeEndTag.length
                break
            }
            default: {
                return null
            }
        }
        let value = input.slice(start, end)
        if (shouldTrim === true) {
            value = value.trim()
        }
        return value
    }

    function getFirstNonSpaceFromPosition(offset = 0) {
        for (let i = position + offset; i < input.length; i++) {
            if (input[i] !== ' ') {
                return i
            }
        }
    }

    function getControlValuePosition() {
        return getFirstNonSpaceFromPosition(options.controlStartTag.length)
    }

    function getNextPosition(currentType) {
        switch (currentType) {
            case K.TOKEN_PLAIN: {
                return Math.min(...[
                    input.indexOf(options.expressionStartTag, position),
                    input.indexOf(options.includeStartTag, position),
                    input.indexOf(options.controlStartTag, position),
                    input.length,
                ].filter(i => i !== -1))
            }
            case K.TOKEN_EXPRESSION: {
                const endTagIndex = input.indexOf(options.expressionEndTag, position + options.expressionStartTag.length)
                if (endTagIndex === -1) {
                    throw new Error('Tokenizer Error - could not find expression end tag ' + options.expressionEndTag)
                }
                return endTagIndex + options.expressionEndTag.length
            }
            case K.TOKEN_INCLUDE: {
                const endTagIndex = input.indexOf(options.includeEndTag, position + options.includeStartTag.length)
                if (endTagIndex === -1) {
                    throw new Error('Tokenizer Error - could not find include end tag ' + options.includeEndTag)
                }
                return endTagIndex + options.includeEndTag.length
            }
            default: {
                const endTagIndex = input.indexOf(options.controlEndTag, position + options.controlStartTag.length)
                if (endTagIndex === -1) {
                    throw new Error('Tokenizer Error - could not find control end tag ' + options.controlEndTag)
                }
                return endTagIndex + options.controlEndTag.length
            }
        }
    }

    function getType() {
        if (input.startsWith(options.expressionStartTag, position) === true) {
            return K.TOKEN_EXPRESSION
        } else if (input.startsWith(options.controlStartTag, position) === true) {
            const valuePosition = getControlValuePosition()
            for (let i = 0; i < controlTypeStrings.length; i++) {
                if (input.startsWith(controlTypeStrings[i].string, valuePosition) === true) {
                    return controlTypeStrings[i].type
                }
            }
            throw new Error('Tokenizer Error - could not identify control tag type')
        } else if (input.startsWith(options.includeStartTag, position) === true) {
            return K.TOKEN_INCLUDE
        }
        return K.TOKEN_PLAIN
    }

    function getTokenRecursively() {
        if (position >= inputLength) {
            cb(tokens)
            return
        }
        let token = { type: getType() }
        let nextPosition = getNextPosition(token.type)
        token.value = getValue(token.type, nextPosition)
        position = nextPosition
        if (token.type === K.TOKEN_INCLUDE) {
            fs.readFile(token.value, 'utf8', (err, newInput) => {
                if (err) throw err
                Tokenizer(newInput, options, newTokens => {
                    tokens = tokens.concat(newTokens)
                    getTokenRecursively()
                })
            })
        } else {
            tokens.push(token)
            getTokenRecursively()
        }
    }
}

module.exports = Tokenizer
