// rollup.config.js
import typescript from 'rollup-plugin-typescript';

export default {
    format: 'cjs',
    sourceMap: 'inline',
    plugins: [
        typescript({
            typescript: require('typescript')
        })
    ],
    external: [
        'handlebars',
        'marked',
        'lodash',
        'path',
        'util',
        'fs-extra',
        'live-server',
        'shelljs',
        'typescript',
        'highlight.js'
    ]
}
