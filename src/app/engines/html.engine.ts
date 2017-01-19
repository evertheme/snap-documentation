import * as fs from 'fs-extra';
import * as path from 'path';
import * as Handlebars from 'handlebars';
//import * as helpers from 'handlebars-helpers';
import { $dependenciesEngine } from './dependencies.engine';

export class HtmlEngine {
    cache: Object = {};
    constructor() {
        //TODO use this instead : https://github.com/assemble/handlebars-helpers
        Handlebars.registerHelper( "compare", function(a, operator, b, options) {
          if (arguments.length < 4) {
            throw new Error('handlebars Helper {{compare}} expects 4 arguments');
          }

          var result;
          switch (operator) {
            case 'indexof':
                result = (b.indexOf(a) !== -1);
                break;
            case '===':
              result = a === b;
              break;
            case '!==':
              result = a !== b;
              break;
            case '>':
              result = a > b;
              break;
            default: {
              throw new Error('helper {{compare}}: invalid operator: `' + operator + '`');
            }
          }

          if (result === false) {
            return options.inverse(this);
          }
          return options.fn(this);
        });
        Handlebars.registerHelper("filterAngular2Modules", function(text, options) {
            const NG2_MODULES:string[] = [
                'BrowserModule',
                'FormsModule',
                'HttpModule',
                'RouterModule'
            ],
                len = NG2_MODULES.length;
            let i = 0,
                result = false;
            for (i; i < len; i++) {
                if (text.indexOf(NG2_MODULES[i]) > -1) {
                    result = true;
                }
            }
            if (result) {
                return options.fn(this);
            } else {
                return options.inverse(this);
            }
        });
        Handlebars.registerHelper("debug", function(optionalValue) {
          console.log("Current Context");
          console.log("====================");
          console.log(this);

          if (optionalValue) {
            console.log("OptionalValue");
            console.log("====================");
            console.log(optionalValue);
          }
        });
        Handlebars.registerHelper('breaklines', function(text) {
            text = Handlebars.Utils.escapeExpression(text);
            text = text.replace(/(\r\n|\n|\r)/gm, '<br>');
            text = text.replace(/ /gm, '&nbsp;');
            text = text.replace(/	/gm, '&nbsp;&nbsp;&nbsp;&nbsp;');
            return new Handlebars.SafeString(text);
        });
        Handlebars.registerHelper('breakComma', function(text) {
            text = Handlebars.Utils.escapeExpression(text);
            text = text.replace(/,/g, ',<br>');
            return new Handlebars.SafeString(text);
        });
        Handlebars.registerHelper('functionSignature', function(method) {
            const args = method.args.map(function(arg) {
                var _result = $dependenciesEngine.find(arg.type);
                if (_result) {
                    if (_result.source === 'internal') {
                        let path = _result.data.type;
                        if (_result.data.type === 'class') path = 'classe';
                        return `${arg.name}: <a href="./${path}s/${_result.data.name}.html" >${arg.type}</a>`;
                    } else {
                        let path = 'https://angular.io/docs/ts/latest/api/' + _result.data.path;
                        return `${arg.name}: <a href="${path}" target="_blank" >${arg.type}</a>`;
                    }
                } else {
                    return `${arg.name}: ${arg.type}`;
                }
            }).join(', ');
            if (method.name) {
                return `${method.name}(${args})`;
            } else {
                return `(${args})`;
            }
        });
        Handlebars.registerHelper('linkType', function(name, options) {
            var _result = $dependenciesEngine.find(name);
            if (_result) {
                this.type = {
                    raw: name
                }
                if (_result.source === 'internal') {
                    if (_result.data.type === 'class') _result.data.type = 'classe';
                    this.type.href = './' + _result.data.type + 's/' + _result.data.name + '.html';
                    this.type.target = '_self';
                } else {
                    this.type.href = 'https://angular.io/docs/ts/latest/api/' + _result.data.path;
                    this.type.target = '_blank';
                }

                return options.fn(this);
            } else {
                return options.inverse(this);
            }
        });
        Handlebars.registerHelper('indexableSignature', function(method) {
            const args = method.args.map(arg => `${arg.name}: ${arg.type}`).join(', ');
            if (method.name) {
                return `${method.name}[${args}]`;
            } else {
                return `[${args}]`;
            }
        });
        Handlebars.registerHelper('object', function(text) {
            text = JSON.stringify(text);
            text = text.replace(/{"/, '{<br>&nbsp;&nbsp;&nbsp;&nbsp;"');
            text = text.replace(/,"/, ',<br>&nbsp;&nbsp;&nbsp;&nbsp;"');
            text = text.replace(/}$/, '<br>}');
            return new Handlebars.SafeString(text);
        });
    }
    init() {
        let partials = [
            'menu',
            'overview',
            'readme',
            'modules',
            'module',
            'components',
            'component',
            'component-detail',
            'directives',
            'directive',
            'injectables',
            'injectable',
            'pipes',
            'pipe',
            'classes',
            'class',
	        'interface',
            'routes',
            'search-results',
            'search-input',
            'link-type'
        ],
            i = 0,
            len = partials.length,
            loop = (resolve, reject) => {
                if( i <= len-1) {
                    fs.readFile(path.resolve(__dirname + '/../src/templates/partials/' + partials[i] + '.hbs'), 'utf8', (err, data) => {
                        if (err) { reject(); }
                        Handlebars.registerPartial(partials[i], data);
                        i++;
                        loop(resolve, reject);
                    });
                } else {
                    resolve();
                }
            }


        return new Promise(function(resolve, reject) {
            loop(resolve, reject);
        });
    }
    render(mainData:any, page:any) {
        var o = mainData,
            that = this;
        Object.assign(o, page);
        return new Promise(function(resolve, reject) {
            if(that.cache['page']) {
                let template:any = Handlebars.compile(that.cache['page']),
                    result = template({
                        data: o
                    });
                resolve(result);
            } else {
                fs.readFile(path.resolve(__dirname + '/../src/templates/page.hbs'), 'utf8', (err, data) => {
                   if (err) {
                       reject('Error during index ' + page.name + ' generation');
                   } else {
                       that.cache['page'] = data;
                       let template:any = Handlebars.compile(data),
                           result = template({
                               data: o
                           });
                       resolve(result);
                   }
               });
            }

        });
    }
};
