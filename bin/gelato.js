#!/usr/bin/env node

const path = require('path')
const caporal = require('caporal')
const Gelato = require('../main')

caporal
    .version('1.0.0')
    .argument('[src...]', 'source file glob patterns')
    .option('-c, --config <file>', 'config <file> config file')
    .option('-d, --dest <directory>', 'dest <directory> destination directory')
    .option('-C, --context <object>', 'context <object> context object')
    .option('-C, --repeat <object>', 'repeat <object> repeat object')
    .option('--expression-start-tag <tag>', 'expression-start-tag <tag> start tag for expression statements')
    .option('--expression-end-tag <tag>', 'expression-end-tag <tag> end tag for expression statements')
    .option('--control-start-tag <tag>', 'control-start-tag <tag> start tag for control statements')
    .option('--control-end-tag <tag>', 'control-end-tag <tag> end tag for control statements')
    .option('--include-start-tag <tag>', 'include-start-tag <tag> start tag for include statements')
    .option('--include-end-tag <tag>', 'include-end-tag <tag> end tag for include statements')
    .action((args, options) => {
        if (args.src.length) options.src = args.src
        if (!options.config) options.config = 'gelatorc'
        if (options.context) options.context = JSON.parse(options.context)
        if (options.repeat) options.repeat = JSON.parse(options.repeat)
        try { options = Object.assign(options.config ? require(path.resolve(process.cwd(), options.config)) : {}, options) }
        catch (err) { if (err.code !== 'MODULE_NOT_FOUND' || err.message.indexOf('gelatorc') === -1) throw err }
        Gelato.run(options)
    })

caporal.parse(process.argv)
