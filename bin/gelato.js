#!/usr/bin/env node

const path = require('path')
const caporal = require('caporal')
const Gelato = require('../index')

caporal
    .version('1.0.0')
    .argument('[src...]', 'src file glob patterns')
    .option('-c, --config <file>', 'config <file> config file')
    .option('-d, --dest <directory>', 'dest <directory> dest directory')
    .option('-C, --context <object>', 'context <object> context object')
    .option('--expression-start-tag <tag>', 'expression-start-tag <tag> start tag for expressions')
    .option('--expression-end-tag <tag>', 'expression-end-tag <tag> end tag for expressions')
    .option('--control-start-tag <tag>', 'control-start-tag <tag> start tag for controls')
    .option('--control-end-tag <tag>', 'control-end-tag <tag> end tag for controls')
    .option('--include-start-tag <tag>', 'include-start-tag <tag> start tag for includes')
    .option('--include-end-tag <tag>', 'include-end-tag <tag> end tag for includes')
    .action((args, options) => {
        if (args.src.length) options.src = args
        if (!options.config) options.config = 'gelatorc'
        try { options = Object.assign(options.config ? require(path.resolve(process.cwd(), options.config)) : {}, options) }
        catch (err) { if (err.code !== 'MODULE_NOT_FOUND') throw err }
        Gelato.run(options)
    })

caporal.parse(process.argv)
