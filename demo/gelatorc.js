const models = [
    {
        name: 'User',
        attributes: [
            {
                name: 'email',
                type: 'string',
                fake: 'internet.email',
            }, {
                name: 'password',
                type: 'string',
                fake: 'internet.password',
            }, {
                name: 'visit_count',
                type: 'int',
                fake: 'random.number',
            }, {
                name: 'dob',
                type: 'date',
                fake: 'date.past',
                required: false,
            },
        ],
    }, {
        name: 'Company',
        attributes: [
            {
                name: 'name',
                type: 'string',
                fake: 'company.companyName',
            }, {
                name: 'address',
                type: 'string',
                fake: 'address.streetAddress',
            }, {
                name: 'tel',
                type: 'string',
                fake: 'phone.phoneNumber',
            },
        ],
    }, {
        name: 'CompanyProduct',
        hasTimestamps: false,
        attributes: [
            {
                name: 'company_id',
                type: 'int',
                fake: 'random.number',
            }, {
                name: 'name',
                type: 'string',
                fake: 'commerce.productName',
            }, {
                name: 'color',
                type: 'string',
                fake: 'commerce.color',
            },
        ],
    }, {
        name: 'CompanyTransaction',
        hasTimestamps: false,
        attributes: [
            {
                name: 'company_id',
                type: 'int',
                fake: 'random.number',
            }, {
                name: 'type',
                type: 'string',
                fake: 'finance.transactionType',
            }, {
                name: 'currency',
                type: 'string',
                fake: 'finance.currencySymbol',
            }, {
                name: 'amount',
                type: 'string',
                fake: 'finance.amount',
            },
        ],
    },
]

const modules = {
    _: require('lodash'),
    _pluralize: require('pluralize'),
    _faker: require('faker'),
}

module.exports = {
    context: Object.assign(modules, {
        $tableName: m => modules._.snakeCase(modules._pluralize(m.name)),
        $sqlValue: (a, v) => a.type === 'int' ? v : '\'' + (a.type === 'string' ? v : new Date(v).toISOString().slice(0, 19).replace('T', ' ')) + '\'',
        $nosqlValue: (a, v) => a.type === 'int' ? v : a.type === 'string' ? `'${v}'` : `new Date('${v}')`,
        models,
        javaTypes: {
            string: 'String',
            int: 'int',
            date: 'Date',
        },
        sqlTypes: {
            string: 'varchar(255)',
            int: 'int',
            date: 'datetime',
        },
    }),
    repeat: {
        'php/model.php.gel': {
            variable: 'model',
            array: 'models',
            filename: '[[ model.name ]].php.gel',
        },
        'java/model.java.gel': {
            variable: 'model',
            array: 'models',
            filename: '[[ model.name ]].java.gel',
        },
        'sql/insert/insert.sql.gel': {
            variable: 'model',
            array: 'models',
            filename: '[[ $tableName(model) ]].sql.gel',
        },
        'nosql/insert.js.gel': {
            variable: 'model',
            array: 'models',
            filename: '[[ model.name ]].js.gel',
        },
    },
}
