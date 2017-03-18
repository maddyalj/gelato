const assert = require('assert')
const exec = require('child_process').exec
const fs = require('fs-extra')

const context = require('../../demo/gelatorc').context

/* global describe before it */
describe('E2E: Demo', function () {
    this.timeout(5000)

    let savedStdout = null
    let savedStderr = null
    const templateFiles = [
        'html/home.html.gel',
        'java/model.java.gel',
        'nosql/insert.js.gel',
        'php/model.php.gel',
        'sql/create.sql.gel',
        'sql/insert/insert.sql.gel',
    ]

    before(cb => {
        fs.emptyDir('demo/build', err => {
            if (err) throw err
            exec('gelato', { cwd: 'demo' }, (err, stdout, stderr) => {
                if (err) throw err
                savedStdout = stdout
                savedStderr = stderr
                cb()
            })
        })
    })

    describe('build', () => {
        it('should indicate that it has read correct 6 template files', () => {
            assert.equal((savedStdout.match(/Reading/g) || []).length, 6)
            templateFiles.forEach(f => assert(savedStdout.indexOf(`Reading ${f}`) !== -1))
        })

        it('should outputed at least one file per template', () => {
            templateFiles.forEach(f => assert(savedStdout.indexOf(`Done writing ${f} -> `) !== -1))
        })

        it('should indicate that it has written 18 output files', () => {
            assert.equal((savedStdout.match(/Done writing/g) || []).length, 18)
        })

        it('should have created correct 5 directories inside build directory', cb => {
            fs.readdir('demo/build', (err, data) => {
                assert.deepEqual(data, ['html', 'java', 'nosql', 'php', 'sql'])
                cb()
            })
        })

        it('should have produced no stderr', () => {
            assert(savedStderr === '')
        })

        describe('html', () => {
            it('should have only home.html', cb => {
                fs.readdir('demo/build/html', (err, data) => {
                    assert.deepEqual(data, ['home.html'])
                    cb()
                })
            })

            describe('home.html', () => {
                let home = null

                before(cb => {
                    fs.readFile('demo/build/html/home.html', 'utf8', (err, data) => {
                        home = data
                        cb()
                    })
                })

                it('should have build/html/home.html starting with _header.html.gel content', cb => {
                    fs.readFile('demo/html/_header.html.gel', 'utf8', (err, header) => {
                        assert.equal(home.indexOf(header), 0)
                        cb()
                    })
                })

                it('should have build/html/home.html ending with _footer.html.gel content', cb => {
                    fs.readFile('demo/html/_footer.html.gel', 'utf8', (err, footer) => {
                        assert.equal(home.indexOf(footer), home.length - footer.length - 1)
                        cb()
                    })
                })

                context.models.forEach(m => {
                    it(`should have h1 tag for ${m.name} model`, cb => {
                        assert(home.indexOf(`<h1>${m.name}</h1>`) !== -1)
                        cb()
                    })

                    it(`should have correct thead for attributes of ${m.name} model`, cb => {
                        let i = m.attributes.length - 1
                        m.attributes.forEach(a => {
                            assert(home.indexOf(`<th>${a.name}</th>`) !== -1)
                            if (i-- === 0) cb()
                        })
                    })
                })
            })
        })

        describe('java', () => {
            it('should have correct 4 java model files', cb => {
                fs.readdir('demo/build/java', (err, data) => {
                    assert.deepEqual(data.sort(), context.models.map(m => `${m.name}.java`).sort())
                    cb()
                })
            })

            let javaFiles = {}

            context.models.forEach(m => {
                describe(`${m.name}.java`, () => {
                    before(cb => {
                        fs.readFile(`demo/build/java/${m.name}.java`, 'utf8', (err, data) => {
                            javaFiles[m.name] = data
                            cb()
                        })
                    })

                    it(`should have class name of ${m.name}`, cb => {
                        assert(javaFiles[m.name].indexOf(`public class ${m.name} {`) !== -1)
                        cb()
                    })

                    it(`should have constructor method ${m.name}`, cb => {
                        assert(javaFiles[m.name].indexOf(`public ${m.name}(long id, `) !== -1)
                        cb()
                    })

                    it(`should have variable definition for each of ${m.name}'s ${m.attributes.length} attributes`, cb => {
                        let i = m.attributes.length - 1
                        m.attributes.forEach(a => {
                            assert(javaFiles[m.name].indexOf(`private final ${context.javaTypes[a.type]} ${context._.camelCase(a.name)};`) !== -1)
                            if (i-- === 0) cb()
                        })
                    })

                    it(`should have getter method for each of ${m.name}'s ${m.attributes.length} attributes`, cb => {
                        let i = m.attributes.length - 1
                        m.attributes.forEach(a => {
                            assert(javaFiles[m.name].indexOf(`public ${context.javaTypes[a.type]} get${context._.upperFirst(context._.camelCase(a.name))}() {`) !== -1)
                            if (i-- === 0) cb()
                        })
                    })

                    it(`should have setter method for each of ${m.name}'s ${m.attributes.length} attributes`, cb => {
                        let i = m.attributes.length - 1
                        m.attributes.forEach(a => {
                            assert(javaFiles[m.name].indexOf(`public void set${context._.upperFirst(context._.camelCase(a.name))}(${context.javaTypes[a.type]} ${context._.camelCase(a.name)}) {`) !== -1)
                            if (i-- === 0) cb()
                        })
                    })
                })
            })
        })

        describe('nosql', () => {
            it('should have correct 4 nosql insert files', cb => {
                fs.readdir('demo/build/nosql', (err, data) => {
                    assert.deepEqual(data.sort(), context.models.map(m => `${m.name}.js`).sort())
                    cb()
                })
            })

            let nosqlFiles = {}

            context.models.forEach(m => {
                describe(`${m.name}.js`, () => {
                    before(cb => {
                        fs.readFile(`demo/build/nosql/${m.name}.js`, 'utf8', (err, data) => {
                            nosqlFiles[m.name] = data
                            cb()
                        })
                    })

                    it(`should be inserting into ${m.name} collection`, cb => {
                        assert(nosqlFiles[m.name].indexOf(`db.${context._pluralize(m.name)}.insertMany( [`) !== -1)
                        cb()
                    })

                    it(`should have object containing key for each of ${m.name}'s ${m.attributes.length} attributes`, cb => {
                        let i = m.attributes.length - 1
                        m.attributes.forEach(a => {
                            assert(nosqlFiles[m.name].indexOf(`${context._.camelCase(a.name)}: `) !== -1)
                            if (i-- === 0) cb()
                        })
                    })
                })
            })
        })

        describe('php', () => {
            it('should have correct 4 php model files', cb => {
                fs.readdir('demo/build/php', (err, data) => {
                    assert.deepEqual(data.sort(), context.models.map(m => `${m.name}.php`).sort())
                    cb()
                })
            })

            let phpFiles = {}

            context.models.forEach(m => {
                describe(`${m.name}.php`, () => {
                    before(cb => {
                        fs.readFile(`demo/build/php/${m.name}.php`, 'utf8', (err, data) => {
                            phpFiles[m.name] = data
                            cb()
                        })
                    })

                    it(`should have class name of ${m.name}`, cb => {
                        assert(phpFiles[m.name].indexOf(`class ${m.name} extends Model`) !== -1)
                        cb()
                    })

                    it(`should have $table variable of value ${context.$tableName(m)}`, cb => {
                        assert(phpFiles[m.name].indexOf(`protected $table = '${context.$tableName(m)}';`) !== -1)
                        cb()
                    })

                    it(`should have $fillable variable of value ['${m.attributes.map(a => a.name).join('\', \'')}']`, cb => {
                        assert(phpFiles[m.name].indexOf(`protected $fillable = ['${m.attributes.map(a => a.name).join('\', \'')}'];`) !== -1)
                        cb()
                    })

                    it(`should${m.hasTimestamps === false ? '' : ' not'} have $timestamps variable${m.hasTimestamps === false ? ' of value false': ''}`, cb => {
                        assert((phpFiles[m.name].indexOf('protected $timestamps = false;') === -1) || (m.hasTimestamps === false))
                        cb()
                    })
                })
            })
        })

        describe('sql', () => {
            it('should have correct 1 create sql file and insert directory', cb => {
                fs.readdir('demo/build/sql', (err, data) => {
                    assert.deepEqual(data.sort(), ['insert', 'create.sql'].sort())
                    cb()
                })
            })

            let createFile = null

            describe('create.sql', () => {
                before(cb => {
                    fs.readFile(`demo/build/sql/create.sql`, 'utf8', (err, data) => {
                        createFile = data
                        cb()
                    })
                })

                context.models.forEach(m => {
                    it(`should have create table of ${context.$tableName(m)}`, cb => {
                        assert(createFile.indexOf(`CREATE TABLE ${context.$tableName(m)} (`) !== -1)
                        cb()
                    })

                    it(`should have column definition for each of ${m.name}'s ${m.attributes.length} attributes`, cb => {
                        let i = m.attributes.length - 1
                        m.attributes.forEach(a => {
                            assert(createFile.indexOf(`${a.name} ${context.sqlTypes[a.type]}${a.required === false ? '' : ' NOT NULL'}`) !== -1)
                            if (i-- === 0) cb()
                        })
                    })
                })
            })

            describe('insert', () => {
                it('should have correct 4 insert sql files', cb => {
                    fs.readdir('demo/build/sql/insert', (err, data) => {
                        assert.deepEqual(data.sort(), context.models.map(m => `${context.$tableName(m)}.sql`).sort())
                        cb()
                    })
                })

                let insertFiles = {}

                context.models.forEach(m => {
                    describe(`${context.$tableName(m)}.sql`, () => {
                        before(cb => {
                            fs.readFile(`demo/build/sql/insert/${context.$tableName(m)}.sql`, 'utf8', (err, data) => {
                                insertFiles[m.name] = data
                                cb()
                            })
                        })

                        it(`should have insert into ${context.$tableName(m)} table`, cb => {
                            assert(insertFiles[m.name].indexOf(`INSERT INTO ${context.$tableName(m)}`) !== -1)
                            cb()
                        })

                        it(`should have list of attributes of ${m.attributes.map(a => a.name).join(', ')}`, cb => {
                            assert(insertFiles[m.name].indexOf(`    (${m.attributes.map(a => a.name).join(', ')})`) !== -1)
                            cb()
                        })
                    })
                })
            })
        })
    })
})
