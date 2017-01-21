const K = require('./constants')

const controlTypeStrings = [
    { type: K.TOKEN_FOR,    string: 'for'     },
    { type: K.TOKEN_EFOR,   string: 'efor'    },
    { type: K.TOKEN_IF,     string: 'if'      },
    { type: K.TOKEN_ELSEIF, string: 'else if' },
    { type: K.TOKEN_ELSE,   string: 'else'    },
    { type: K.TOKEN_EIF,    string: 'eif'     },
]

function Tokenizer(input, options = {}) {
    function setDefaultOption(option, value) {
        if (typeof options[option] === 'undefined') {
            options[option] = value
        }
    }

    setDefaultOption('expressionStartTag', '[[')
    setDefaultOption('expressionEndTag',   ']]')
    setDefaultOption('controlStartTag',    '[!')
    setDefaultOption('controlEndTag',      '!]')

    let position = 0
    const inputLength = input.length
    let tokens = []
    while (position < inputLength) {
        tokens.push(getToken())
    }
    return tokens

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
                let nextExpressionPosition = input.indexOf(options.expressionStartTag, position)
                let nextControlPosition = input.indexOf(options.controlStartTag, position)
                if (nextExpressionPosition === -1 && nextControlPosition === -1) {
                    return input.length
                } else if (
                    nextExpressionPosition > nextControlPosition && nextControlPosition === -1
                    || nextExpressionPosition < nextControlPosition && nextExpressionPosition !== -1
                ) {
                    return nextExpressionPosition
                } else {
                    return nextControlPosition
                }
            }
            case K.TOKEN_EXPRESSION: {
                return input.indexOf(options.expressionEndTag, position + options.expressionStartTag.length) + options.expressionEndTag.length
            }
            default: {
                return input.indexOf(options.controlEndTag, position + options.controlStartTag.length) + options.controlEndTag.length
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
        }
        return K.TOKEN_PLAIN
    }

    function getToken() {
        let token = { type: getType() }
        let nextPosition = getNextPosition(token.type)
        token.value = getValue(token.type, nextPosition)
        position = nextPosition
        return token
    }
}

module.exports = Tokenizer
