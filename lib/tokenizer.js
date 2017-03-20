const fs = require('fs-extra')

const K = require('./constants')

// strings to look for after controlStartTag to identify control token type
const controlTypeStrings = [
    { type: K.TOKEN_FOR,    string: 'for'     },
    { type: K.TOKEN_EFOR,   string: 'efor'    },
    { type: K.TOKEN_IF,     string: 'if'      },
    { type: K.TOKEN_ELSEIF, string: 'else if' },
    { type: K.TOKEN_ELSE,   string: 'else'    },
    { type: K.TOKEN_EIF,    string: 'eif'     },
]

/**
 * Tokenizer takes in template file content and converts it into list of tokens
 * @param {string}   input          template file content
 * @param {object}   [options={}]   Gelato config options
 * @param {string}   [inputFile=''] name of template file
 * @param {function} [cb=()=>{}]    function to call once Tokenizer is done
 */
function Tokenizer(input, options = {}, inputFile = '', cb = () => {}) {
    // set default config options if not provided by user
    options = Object.assign({
        src: '**/[^_]*.gel',
        dest: 'build',
        context: {},
        repeat: {},
        expressionStartTag: '[[',
        expressionEndTag: ']]',
        controlStartTag: '[!',
        controlEndTag: '!]',
        includeStartTag: '[@',
        includeEndTag: '@]',
    }, options)

    let position = 0
    let line = 1
    let column = 1
    const inputLength = input.length
    let tokens = []
    getTokenRecursively()

    /**
     * Parse input to get the value of token based on the type of the token
     * @param  {string} type         token type
     * @param  {int}    nextPosition position of next token
     * @return {string}              token value
     */
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

    /**
     * Finds index of first non space character
     * @param  {int} [offset=0] index to start searching from after position
     * @return {int}            found index
     */
    function getFirstNonSpaceFromPosition(offset = 0) {
        for (let i = position + offset; i < inputLength; i++) {
            if (input[i] !== ' ') {
                return i
            }
        }
    }

    /**
     * Finds index of value of control token
     * @return {int}  found index
     */
    function getControlValuePosition() {
        return getFirstNonSpaceFromPosition(options.controlStartTag.length)
    }

    /**
     * Finds index of next token
     * @param  {string} currentType   current token type
     * @param  {string} toIndex       index of line end to stop search at
     * @param  {string} errorLocation error location to display after error messages
     * @return {int}                  found index
     */
    function getNextPosition(currentType, toIndex, errorLocation) {
        switch (currentType) {
            case K.TOKEN_PLAIN: {
                return Math.min(...[
                    input.indexOf(options.expressionStartTag, position),
                    input.indexOf(options.includeStartTag, position),
                    input.indexOf(options.controlStartTag, position),
                    inputLength,
                ].filter(i => i !== -1))
            }
            case K.TOKEN_EXPRESSION: return getNextPositionUsingEndTag('expression')
            case K.TOKEN_INCLUDE:    return getNextPositionUsingEndTag('include')
            default:                 return getNextPositionUsingEndTag('control')
        }

        /**
         * Finds index of next token using its end tag
         * @param  {string} tagType type of tag
         * @return {int}            found index
         */
        function getNextPositionUsingEndTag(tagType) {
            const endTagIndex = input.slice(0, toIndex).indexOf(options[`${tagType}EndTag`], position + options[`${tagType}StartTag`].length)
            if (endTagIndex === -1) {
                throw new Error(`Tokenizer Error - could not find ${tagType} end tag ${options[`${tagType}EndTag`]} ${errorLocation}`)
            }
            return endTagIndex + options[`${tagType}EndTag`].length
        }
    }

    /**
     * Identifies type of current token
     * @param  {string} errorLocation error location to display after error messages
     * @return {int}                  token type
     */
    function getType(errorLocation) {
        if (input.startsWith(options.expressionStartTag, position) === true) {
            return K.TOKEN_EXPRESSION
        } else if (input.startsWith(options.controlStartTag, position) === true) {
            const valuePosition = getControlValuePosition()
            for (let i = 0; i < controlTypeStrings.length; i++) {
                if (input.startsWith(controlTypeStrings[i].string, valuePosition) === true) {
                    return controlTypeStrings[i].type
                }
            }
            throw new Error(`Tokenizer Error - invalid control tag type ${errorLocation}`)
        } else if (input.startsWith(options.includeStartTag, position) === true) {
            return K.TOKEN_INCLUDE
        }
        return K.TOKEN_PLAIN
    }

    /**
     * Updates line and column variable values for keeping track of error locations
     * @param {int} offset index of next token
     */
    function updateLineAndColumn(offset) {
        const str = input.slice(position, offset)
        const lines = str.split('\n').length - 1
        line += lines
        if (lines > 0) column = offset - (position + str.lastIndexOf('\n'))
        else column += offset - position
    }

    /**
     * Recursively gets the next token and reads external file if it is an include token
     */
    function getTokenRecursively() {
        // if no more tokens, call callback function and terminate
        if (position >= inputLength) {
            cb(tokens)
            return
        }

        // index of end of line
        const toIndex = Math.min(...[
            input.indexOf('\n', position),
            inputLength,
        ].filter(i => i !== -1))
        const errorLocation = `(${inputFile}:${line}:${column})
                ${input.slice(position, toIndex)}
                ^`
        let token = { type: getType(errorLocation), errorLocation }
        let nextPosition = getNextPosition(token.type, toIndex, errorLocation)
        updateLineAndColumn(nextPosition)
        token.value = getValue(token.type, nextPosition)
        position = nextPosition

        // if it is an include token, read included file and run Tokenizer on it
        if (token.type === K.TOKEN_INCLUDE) {
            fs.readFile(`${inputFile.substr(0, inputFile.lastIndexOf('/') + 1)}${token.value}`, 'utf8', (err, newInput) => {
                if (err) throw new Error(`Tokenizer Error - could not open file '${token.value}' ${errorLocation}`)
                Tokenizer(newInput, options, token.value, newTokens => {
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
