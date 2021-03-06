const K = require('./constants')

/**
 * Returns value of a token object
 * @param  {object} token a token coming from Evaluator
 * @return {string}       value of token
 */
function getExpressionValue(token) {
    return token.value
}

/**
 * Returns index of the next Efor token
 * @param  {array} tokens tokens coming from Evaluator
 * @param  {int}   start  index of token to start looking from
 * @return {int}          index found of next Efor token
 */
function getEforIndex(tokens, start) {
    let level = 0
    for (let i = start; i < tokens.length; i++) {
        if (tokens[i].type === K.TOKEN_FOR) {
            level++
        } else if (tokens[i].type === K.TOKEN_EFOR) {
            if (level === 0) {
                return i
            }
            level--
        }
    }
    throw new Error(`Parser Error - could not find Efor tag for For tag ${tokens[start - 1].errorLocation}`)
}

/**
 * Returns indexes of the next ElseIf, Else and Eif tokens
 * @param  {array} tokens tokens coming from Evaluator
 * @param  {int}   start  indexes of token to start looking from
 * @return {array}        indexes found of next ElseIf, Else and Eif tokens
 */
function getIfRelatedIndexes(tokens, start) {
    let indexes = {
        [K.TOKEN_ELSEIF]: [],
        [K.TOKEN_ELSE]:   null,
        [K.TOKEN_EIF]:    null,
    }
    let level = 0
    let tokenLength = tokens.length
    for (let i = start; i < tokenLength; i++) {
        if (tokens[i].type === K.TOKEN_IF) {
            level++
            continue
        }
        if (level > 0) {
            if (tokens[i].type === K.TOKEN_EIF) {
                level--
            }
            continue
        }
        switch (tokens[i].type) {
            case K.TOKEN_ELSEIF: {
                indexes[K.TOKEN_ELSEIF].push(i)
                break
            }
            case K.TOKEN_ELSE: {
                indexes[K.TOKEN_ELSE] = i
                break
            }
            case K.TOKEN_EIF: {
                indexes[K.TOKEN_EIF] = i
                i = tokenLength
                break
            }
        }
    }
    if (indexes[K.TOKEN_EIF] === null) {
        throw new Error(`Parser Error - could not find Eif tag for If tag ${tokens[start - 1].errorLocation}`)
    }
    return indexes
}

/**
 * Parser takes in Evaluator's tokens and converts them into an AST
 * @param  {array} tokens     tokens coming from Evaluator
 * @param  {int}   [start=0]  first token to parse
 * @param  {int}   [end=null] last token to parse
 * @return {array}            list of AST nodes
 */
function Parser(tokens, start = 0, end = null) {
    let nodes = []
    let i = start
    if (end === null) {
        end = tokens.length
    }
    while (i < end) {
        switch (tokens[i].type) {
            case K.TOKEN_PLAIN: {
                nodes.push({
                    type: K.NODE_PLAIN,
                    value: tokens[i].value,
                    errorLocation: tokens[i].errorLocation,
                })
                i++
                break
            }
            case K.TOKEN_EXPRESSION: {
                nodes.push({
                    type: K.NODE_EXPRESSION,
                    value: getExpressionValue(tokens[i]),
                    errorLocation: tokens[i].errorLocation,
                })
                i++
                break
            }
            case K.TOKEN_FOR: {
                const indexOfIn = tokens[i].value.indexOf(' in ')
                const eforIndex = getEforIndex(tokens, i + 1)
                nodes.push({
                    type: K.NODE_FOR,
                    variable: tokens[i].value.slice(0, indexOfIn).trim(),
                    array: tokens[i].value.slice(indexOfIn + 4).trim(),
                    nodes: Parser(tokens, i + 1, eforIndex),
                    errorLocation: tokens[i].errorLocation,
                })
                i = eforIndex + 1
                break
            }
            case K.TOKEN_IF: {
                const indexes = getIfRelatedIndexes(tokens, i + 1)
                const lastIfToken = indexes[K.TOKEN_ELSEIF].length > 0 ? indexes[K.TOKEN_ELSEIF][0] : (
                    indexes[K.TOKEN_ELSE] !== null ? indexes[K.TOKEN_ELSE] : indexes[K.TOKEN_EIF]
                )
                let node = {
                    type: K.NODE_IF,
                    condition: tokens[i].value,
                    nodes: Parser(tokens, i + 1, lastIfToken),
                    elseIfs: [],
                    elseNodes: indexes[K.TOKEN_ELSE] !== null ? Parser(tokens, indexes[K.TOKEN_ELSE] + 1, indexes[K.TOKEN_EIF]) : [],
                    errorLocation: tokens[i].errorLocation,
                }
                indexes[K.TOKEN_ELSEIF].forEach((e, j) => {
                    const lastElseIfToken = j + 1 < indexes[K.TOKEN_ELSEIF].length ? indexes[K.TOKEN_ELSEIF][j + 1] : (
                        indexes[K.TOKEN_ELSE] !== null ? indexes[K.TOKEN_ELSE] : indexes[K.TOKEN_EIF]
                    )
                    node.elseIfs.push({
                        condition: tokens[e].value,
                        nodes: Parser(tokens, e + 1, lastElseIfToken),
                    })
                })
                nodes.push(node)
                i = indexes[K.TOKEN_EIF] + 1
                break
            }
        }
    }
    return nodes
}

module.exports = Parser
