// Copyright © 2020 Brandon Li. All rights reserved.

/**
 * Build encapsulation that minifies, mangles, requirejs optimizes?, ...etc.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

module.exports = ( () => {
  'use strict';

  // modules
  const babel = require( 'babel-core' ); // eslint-disable-line require-statement-match
  const path = require( 'path' );
  const terser = require( 'terser' );
  const Util = require( './Util' );

  // constants
  const MINIFY_DEFAULTS = {
    babelTranspile: true,
    mangle: true,
    beautify: false
  };

  class Builder {

    /**
     * Minifies the given JS code using Terser.
     * See https://terser.org/docs/api-reference for more documentation.
     * @public
     *
     * @param {string} code - code to minify
     * @returns {string} - the minified code
     */
    static minify( code, options ) {

      options = {
        ...MINIFY_DEFAULTS,

        // override the defaults with the passed in options
        ...options
      };

      // Do transpilation before minifying.
      if ( options.babelTranspile ) code = Builder.transpile( code );

      // Create the terser minify options. See https://terser.org/docs/api-reference#minify-options.
      const terserOptions = {
        mangle: options.mangle ? {
          safari10: true
        } : false,
        compress: {
          dead_code: true, // remove unreachable code

          // To define globals, use global_defs inside compress options, see https://github.com/jrburke/r.js/issues/377
          global_defs: {}
        },
        output: {
          beautify: options.beautify
        }
      };

      const minify = terser.minify( code, terserOptions );
      if ( minify.error ) { Util.throw( minify.error ); }
      return minify.code;
    }

    /**
     * Transpiles code from ES6+ to browser-compatible JavaScript for older browsers or environments (ES5) using Babel.
     * See https://babeljs.io/docs/en/ for more documentation.
     * @public
     *
     * @param {string} code - code to transpile
     * @returns {string} - the transpiled code
     */
    static transpile( code ) {

      // See options available at https://babeljs.io/docs/en/options
      return babel.transform( code, {
        // Avoids a warning that this gets disabled for >500kb of source.
        compact: true,

        presets: [ [ `${ process.cwd() }/node_modules/babel-preset-env`, {

          // Parse as "script" type, so "this" will refer to "window" instead of being transpiled to `void 0` aka undefined
          modules: false,
          targets: {
            browsers: [
              // See http://browserl.ist/?q=%3E+0.5%25%2C+safari+9-11%2C+Firefox+ESR%2C+IE+11%2C+ios_saf+11
              '> 0.5%',
              'safari 9-11',
              'Firefox ESR',
              'IE 11',
              'ios_saf 11'
            ]
          }
        } ] ]
      } ).code;
    }
  }

  return Builder;
} )();