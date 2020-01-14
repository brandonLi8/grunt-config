// Copyright © 2020 Brandon Li. All rights reserved.

/**
 * Build encapsulation that minifies, mangles, requirejs optimizes?, ...etc.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

module.exports = ( () => {
  'use strict';

  // modules
  const babel = require( '@babel/core' ); // eslint-disable-line require-statement-match
  const path = require( 'path' );
  const terser = require( 'terser' );
  const Util = require( './Util' );
  const requirejs = require( 'requirejs' );
  const grunt = require( 'grunt' );
  const Generator = require( './Generator' );

  // constants
  const MINIFY_DEFAULTS = {
    babelTranspile: true,
    mangle: true,
    beautify: false
  };
  // Reference to the validated and parsed generator replacement values (see ./Generator.js for more documentation).
  const GENERATOR_VALUES = Generator.getReplacementValuesMapping();

  class Builder {

    static async build( minifyOptions ) {

      const requireJS = await this.optimizeAMD( path.join( process.cwd(), `/js/${ GENERATOR_VALUES.REPO_NAME }-config.js` ) );

      // Checks if lodash exists
      const testLodash = '  if ( !window.hasOwnProperty( \'_\' ) ) {\n' +
                         '    throw new Error( \'Underscore/Lodash not found: _\' );\n' +
                         '  }\n';
      // Checks if jQuery exists
      const testJQuery = '  if ( !window.hasOwnProperty( \'$\' ) ) {\n' +
                         '    throw new Error( \'jQuery not found: $\' );\n' +
                         '  }\n';

      let fullSource =  requireJS;
      fullSource = `(function() {\n${fullSource}\n}());`;

      fullSource = this.minify( fullSource, minifyOptions );
            // // Wrap with an IIFE

      return fullSource;
    };

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
          safari10: true,
          module: true
        } : false,
        compress: {
          dead_code: true // remove unreachable code
        },
        output: {
          beautify: options.beautify,
          comments: ''
        }
      };

      const minify = terser.minify( code, terserOptions );
      if ( minify.error ) { Util.throw( minify.error ); }
      return minify.code;
    }

    /**
     * Runs a require.js optimizer build step for and AMD project.
     * @public
     *
     * @param {string} configFile - path to the config file
     * @param {Object} [options]
     * @returns {Promise.<string>} - The combined JS output from the optimizer
     */
    static optimizeAMD( configFile, options ) {

      options = {
        // {Object|boolean} - See https://github.com/requirejs/r.js/blob/master/build/example.build.js for the wrap
        // documentation, as it lists all of the available options.
        wrap: false,

        insertRequire: `${ GENERATOR_VALUES.REPO_NAME }-main`,
        ...options
      };
      let output;
      // All options are documented at https://github.com/requirejs/r.js/blob/master/build/example.build.js
      const config = {


        // Includes a require.js stub called almond, so that we don't have to include the full require.js runtime
        // inside of builds. This helps reduce file size, and the rest of require.js isn't needed.
        // See https://github.com/requirejs/almond for more about specifying name=almond
        name: 'almond',
        optimize: 'none',
        wrap: options.wrap,

        // Avoid optimization names that are outside the baseUrl, see http://requirejs.org/docs/optimization.html#pitfalls
        paths: {
          almond: process.cwd() + '/node_modules/almond/almond'
        },

        // JS config file
        mainConfigFile: configFile,

        onBuildRead: ( moduleName, path, contents ) => {

          return this.transpile( contents, { compact: false, plugins: [ ["@babel/plugin-proposal-object-rest-spread", { "loose": true, "useBuiltIns": true }] ], presets: null } );
        },

        // optimized output file
        out( js, sourceMap ) {
          output = js;
        },

        // turn on preservation of comments that have a license in them
        preserveLicenseComments: false,

        // modules to stub out in the optimized file
        stubModules: [ 'text', 'image' ],
        optimizeAllPluginResources: true,
        inlineText: true,
        insertRequire: options.insertRequire ? [ options.insertRequire ] : null
      };


      return new Promise( ( resolve, reject ) => {

        requirejs.optimize( config, function( buildResponse ) {
          resolve( output );
        }, function( err ) {
          reject( new Error( err ) );
        } );
      } );
    }

    /**
     * Transpiles code from ES6+ to browser-compatible JavaScript for older browsers or environments (ES5) using Babel.
     * See https://babeljs.io/docs/en/ for more documentation.
     * @public
     *
     * @param {string} code - code to transpile
     * @returns {string} - the transpiled code
     */
    static transpile( code, options ) {

      options = {
        // Avoids a warning that this gets disabled for >500kb of source.
        compact: true,
        // plugins: [ '@babel/plugin-proposal-object-rest-spread', '@babel/plugin-transform-classes' ],
        presets: [ [ `${ process.cwd() }/../grunt-config/node_modules/@babel/preset-env`, {

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
        } ] ],

        ...options
      };

      // See options available at https://babeljs.io/docs/en/options
      return babel.transform( code, options ).code;
    }
  }

  return Builder;
} )();