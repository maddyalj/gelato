const vm = require('vm')

const K = require('./constants')

/**
 * Evaluates a given javascript expression using the vm module
 * @param  {string} expression    javascript expression
 * @param  {object} context       context object containing variables
 * @param  {string} errorLocation error location to display after error messages
 * @return string                 evaluation result
 */
function evaluateExpression(expression, context, errorLocation) {
    try {
        return vm.runInContext(expression, context)
    } catch (err) {
        throw new Error(`Evaluator Error - ${err.message} ${errorLocation}`)
    }
}

/**
 * takes a node and evaluates it based on its type
 * @param  {object} node    AST node coming from Parser
 * @param  {object} context context object containing variables
 * @return string           evaluation result
 */
function makeOutput(node, context) {
    switch (node.type) {
        case K.NODE_EXPRESSION: {
            return evaluateExpression(node.value, context, node.errorLocation)
        }
        case K.NODE_FOR: {
            let output = ''
            let array = evaluateExpression(node.array, context, node.errorLocation)
            if (!array.forEach) array = []
            array.forEach(e => {
                const subContext = Object.assign({}, context)
                subContext[node.variable] = e
                output += Evaluator(node.nodes, subContext)
            })
            return output
        }
        case K.NODE_IF: {
            if (evaluateExpression(node.condition, context, node.errorLocation)) {
                return Evaluator(node.nodes, context)
            }
            for (let i = 0; i < node.elseIfs.length; i++) {
                if (evaluateExpression(node.elseIfs[i].condition, context, node.errorLocation)) {
                    return Evaluator(node.elseIfs[i].nodes, context)
                }
            }
            if (node.elseNodes.length > 0) {
                return Evaluator(node.elseNodes, context)
            }
            return ''
        }
        default: {
            return node.value
        }
    }
}

/**
 * Evaluator takes in AST and context and attempts to evaluate them
 * @param {array}  nodes        AST nodes coming from Parser
 * @param {object} [context={}] [description]
 * @return string               evaluation result
 */
function Evaluator(nodes, context = {}) {
    vm.createContext(context)
    let output = ''
    nodes.forEach(t => {
        output += makeOutput(t, context)
    })
    return output
}

module.exports = Evaluator
