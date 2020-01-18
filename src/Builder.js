// Copyright © 2020 Brandon Li. All rights reserved.

/**
 * Builder/compiler that optimizes, minifies, mangles, and transpiles code.
 *
 * Requires the root repository that invoked the command to contain a buildrc.json file that configures the build
 * options such as output location and source code location. See grunt-config/example.buildrc.json for an example
 * buildrc file and full documentation of all available options.
 *
 * Uses Terser for minification and Babel for transpilation. See https://terser.org and https://babeljs.io.
 *
 * If the project is a requirejs project (indicated in the buildrc file), will use the r.js build optimizer to compile
 * the project into one file before minifying and transpiling. See https://requirejs.org/docs/optimization.html.
 * There is an option to generate a _build.html file with the requirejs minified code as the only script. This only
 * works if there is an index.html file.
 *
 * Otherwise, if the project isn't a requirejs project, this file will optimize the .js files in the source directory
 * and copy it over it to the build directory (with the same relative subdirectory paths).
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

module.exports = ( () => {
  'use strict';

  // modules
  const babel = require( '@babel/core' ); // eslint-disable-line require-statement-match
  const Generator = require( './Generator' );
  const grunt = require( 'grunt' );
  const path = require( 'path' );
  const requirejs = require( 'requirejs' );
  const shell = require( 'shelljs' ); // eslint-disable-line require-statement-match
  const terser = require( 'terser' );
  const Util = require( './Util' );

  // constants
  // Read the buildrc file if it exists.
  const BUILD_RC = grunt.file.isFile( 'buildrc.json' ) ? grunt.file.readJSON( 'buildrc.json' ) : undefined;





  const MINIFY_DEFAULTS = {
    babelTranspile: true,
    mangle: true,
    beautify: false
  };
  // Reference to the validated and parsed generator replacement values (see ./Generator.js for more documentation).
  const GENERATOR_VALUES = Generator.getReplacementValuesMapping();

  class Builder {

    /**
     * The main API of this file. Runs the builder/compiler such that it optimizes, minifies, mangles, and transpiles code based on a buildrc file.
     * See the comment at the top of the file for more documentation.
     * @public
     */
    static async build() {

      // Check that the user has implemented the buildrc.json file.
      Util.assert( BUILD_RC, 'buildrc.json is required for building and was not found.\n'
        + 'See grunt-config/example.buildrc.json for an example.' );

      // If provided, run the preBuild command before building.
      if ( BUILD_RC.preBuild ) shell.exec( BUILD_RC.preBuild, { silent: true } );

      // Read the source and build directory from the buildrc with defaults.
      const sourceDirectory = Util.toAbsolutePath( BUILD_RC.sourceDirectory ? '.' );
      const buildDirectory = Util.toAbsolutePath( BUILD_RC.buildDirectory ? 'build' );

      // If the project is a requirejs project.
      if ( BUILD_RC.requirejs ) {
        Util.assert( Object.getPrototypeOf( BUILD_RC.requirejs ) === Object.prototype,
          'the buildrc.json requirejs key must map to a object.' );

        // Optimize the requirejs project.
        let optimzedRequireJs = `(function() {\n${ await this.optimizeAMD( BUILD_RC.requirejs ); }\n}());`;

        // Minify the optimized requirejs.
        optimzedRequireJs = this.minify( optimzedRequireJs );

        // Write the optimized requirejs into the output file.
        grunt.file.write( path.join( buildDirectory, BUILD_RC.requirejs.outputFile ), optimzedRequireJs );

        if ( BUILD_RC.requirejs.generateBuildHtml ) {
          Generator.registerValues
        }
      }
    };

    /**
     * "Compresses" a file based on options that are passed that indicate if the file should be
     * If shouldThrow = true, this will throw an error if the first line was not a correct copyright statement.
     * Otherwise, this will return a boolean indicating if the first line was a correct copyright statement.
     * @public
     *
     * @param {String} filePath - path of the file, relative to the root directory that invoked the command.
     * @param {boolean} shouldThrow - indicates if an error should be thrown if the copyright statement is incorrect.
     * @returns {null|boolean} - if shouldThrow = false, will return a boolean indicating if the copyright was correct.
     */
    // static compressFile( filePath ) {

    // }
    /**
     * Updates the copyright statement(s) of either a file or all files of a directory, depending on what is passed in.
     * If the given path isn't a real file or directory, an error will be thrown. If the path is a directory, only files
     * that don't fall into the IGNORE_PATTERN and have an extension in EXTENSION_COMMENT_PARSER_MAP will be updated.
     * @public
     *
     * @param {String} path - either a file or directory to update copyright statement(s).
     */
    // static updateCopyright( path ) {
    //   Util.assert( grunt.file.exists( path ), `path doesn't exist: ${ Util.toRepoPath( path ) }` );

    //   // If the given path is a file, use updateFileCopyright to update the file.
    //   if ( grunt.file.isFile( path ) ) this.updateFileCopyright( path );

    //   // If the given path is a directory, update the copyright statement of all files.
    //   if ( grunt.file.isDir( path ) ) {

    //     // Recurse through the directory with grunt API. See https://gruntjs.com/api/grunt.file#grunt.file.recurse
    //     grunt.file.recurse( path, filePath => {

    //       // Only update the copyright statement if it's a supported file type and if it's not in the ignore pattern.
    //       if ( !IGNORE_PATTERN.ignores( filePath ) && Util.getExtension( filePath ) in EXTENSION_COMMENT_PARSER_MAP ) {

    //         // update the copyright statement
    //         this.updateFileCopyright( filePath );
    //       }
    //     } );
    //   }
    // }



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
          comments: '',
          preamble: `// Copyright © . All rights reserved.\n\n` +
                    '/**\n' +
                    ` * @license sim-core 0.0.0-dev.18\n` +
                    ` * Released under MIT, https:\n` +
                    ' */'
        }
      };
/**
 * @license almond 0.3.3 Copyright jQuery Foundation and other contributors.
 * Released under MIT license, http://github.com/requirejs/almond/LICENSE
 */

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

  //----------------------------------------------------------------------------------------
  // Helpers
  //----------------------------------------------------------------------------------------

  /**
   * Validates the buildrc object literal, which is parsed from the buildrc.json file. See the comment at the top of the
   * file for more documentation. See grunt-config/example.buildrc.json for documentation on the required and optional
   * configuration options. Will throw errors if the buildrc doesn't exist or isn't implemented correctly.
   */
  function validateBuildRC() {
    // First check that the user has implemented the buildrc.json file.
    Util.assert( BUILD_RC, 'buildrc.json is required for building and was not found.\n'
        + 'See grunt-config/example.buildrc.json for an example.' );

    if ( BUILD_RC.requirejs ) {
      const requirejsRequiredOptions = [ 'configFile', 'mainEntryFile', 'outputFile' ];

      requirejsRequiredOptions.forEach( option => {
        Util.assert( BUILD_RC.requirejs.hasOwnProperty( option ),  );
      } );
    }
  }



  return Builder;
} )();