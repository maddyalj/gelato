const vm = require('vm')

const K = require('./constants')

function evaluateExpression(expression, context) {
    try {
        return vm.runInContext(expression, context)
    } catch (err) {
        if (err.name !== 'ReferenceError' && err.name !== 'SyntaxError') throw err
        return 'undefined'
    }
}

function makeOutput(node, context) {
    switch (node.type) {
        case K.NODE_EXPRESSION: {
            return evaluateExpression(node.value, context)
        }
        case K.NODE_FOR: {
            let output = ''
            const array = evaluateExpression(node.array, context)
            if (!array.forEach) return output
            array.forEach(e => {
                const subContext = Object.assign({}, context)
                subContext[node.variable] = e
                output += Evaluator(node.nodes, subContext)
            })
        }
        case K.NODE_IF: {
            if (evaluateExpression(node.condition, context)) {
                return Evaluator(node.nodes, context)
            }
            for (let i = 0; i < node.elseIfs.length; i++) {
                if (evaluateExpression(node.elseIfs[i].condition, context)) {
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

function Evaluator(nodes, context = {}) {
    vm.createContext(context)
    let output = ''
    nodes.forEach(t => {
        output += makeOutput(t, context)
    })
    return output
}

module.exports = Evaluator
