import * as chai from 'chai';
const expect = chai.expect;

import {temporaryDir, shell, pkg, exists, exec, read} from '../helpers';
const tmp = temporaryDir();
const tsconfigPath = require.resolve('../../../tsconfig.json');
const tsNodePath = require.resolve('../../../node_modules/.bin/ts-node');
const env = Object.freeze({TS_NODE_PROJECT: tsconfigPath, MODE:'TESTING'});

describe('CLI routes', () => {

    let stdoutString = null,
        routesIndex;
    before(function (done) {
        tmp.create();
        exec(tsNodePath + ' ./bin/index-cli.js -p ./test/src/todomvc-ng2/src/tsconfig.json -d ' + tmp.name + '/', {env}, (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                done('error');
                return;
            }
            stdoutString = stdout;
            routesIndex = read(`${tmp.name}/js/routes/routes_index.js`);
            done();
        });
    });
    after(() => tmp.clean());

    it('it should have a route index', () => {
        const isFileExists = exists(`${tmp.name}/js/routes/routes_index.js`);
        expect(isFileExists).to.be.true;
    });
    it('it should have generated files', () => {
        expect(routesIndex).to.contain('AppModule');
        expect(routesIndex).to.contain('AppRoutingModule');
        expect(routesIndex).to.contain('HomeRoutingModule');
    });
});
