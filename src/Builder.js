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
 * There is an option to generate a index.html file with the requirejs minified code as the only script. This only
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
  const fs = require( 'fs' );
  const Generator = require( './Generator' );
  const grunt = require( 'grunt' );
  const path = require( 'path' );
  const requirejs = require( 'requirejs' );
  const shell = require( 'shelljs' ); // eslint-disable-line require-statement-match
  const terser = require( 'terser' );
  const UserConfig = require( './UserConfig' );
  const Util = require( './Util' );

  // constants
  const DEFUALT_BUILD_OPTIONS = {
    sourceDirectory: '.',
    buildDirectory: 'build',
    compress: {
      minify: true,
      mangle: true,
      minifyOverrideOptions: {},
      babelTranspile: true,
      babelOverrideOptions: {}
    },
    requirejs: null,
    preBuild: null,
    postBuild: null
  };
  const DEFAULT_REQUIRE_JS_OPTIONS = {
    configFile: `js/${ Generator.getValue( 'REPO_NAME' ) }-config.js`,
    mainEntry: `${ Generator.getValue( 'REPO_NAME' ) }-main`,
    outputFile: `${ Generator.getValue( 'REPO_NAME' ) }-${ Generator.getValue( 'VERSION' ) }.min.js`,
    generateBuildHtml: true,
    overrideOptions: {}
  };
  const MINIFY_DEFAULTS = {
    babelTranspile: true,
    mangle: true,
    beautify: false
  };

  class Builder {

    /**
     * The main API of this file. Runs the builder/compiler such that it optimizes, minifies, mangles, and transpiles code based on a buildrc file.
     * See the comment at the top of the file for more documentation.
     * @public
     */
    static async build() {

      // Check that the user has implemented the buildrc.json file.
      Util.assert( UserConfig.BUILD_RC, 'buildrc.json is required for building and was not found.\n'
        + 'See grunt-config/example.buildrc.json for an example.' );

      // Get the build configuration.
      const buildConfiguration = { ...DEFUALT_BUILD_OPTIONS, ...UserConfig.BUILD_RC };
      buildConfiguration.compress = { ...DEFUALT_BUILD_OPTIONS.compress, ...UserConfig.BUILD_RC.compress };

      // If provided, run the preBuild command before building.
      if ( buildConfiguration.preBuild ) shell.exec( buildConfiguration.preBuild );

      // Read the source and build directory from the buildrc with defaults.
      const sourceDirectory = Util.toAbsolutePath( buildConfiguration.sourceDirectory );
      const buildDirectory = Util.toAbsolutePath( buildConfiguration.buildDirectory );

      let originalSize = 0;
      let newSize = 0;

      // If the project is a requirejs project.
      if ( buildConfiguration.requirejs ) {
        Util.assert( Object.getPrototypeOf( buildConfiguration.requirejs ) === Object.prototype,
          'the buildrc.json requirejs key must map to a object.' );
        buildConfiguration.requirejs = { ...DEFAULT_REQUIRE_JS_OPTIONS, ...UserConfig.BUILD_RC.requirejs };
        buildConfiguration.requirejs.configFile = path.join( sourceDirectory, buildConfiguration.requirejs.configFile );

        let optimized = await this.optimizeAMD( buildConfiguration.requirejs );
        originalSize = optimized.originalSize;

        // Optimize the requirejs project.
        let optimzedRequireJs = `(function() {\n${ optimized.code }\n}());`;

        // Babel-transpile
        if ( buildConfiguration.compress.babelTranspile ) {
          optimzedRequireJs = this.transpile( optimzedRequireJs, buildConfiguration.compress.babelOverrideOptions );
        }

        // Minify the optimized requirejs.
        optimzedRequireJs = this.minify( optimzedRequireJs, buildConfiguration.compress.minifyOverrideOptions );

        // Write the optimized requirejs into the output file.
        grunt.file.write( path.join( buildDirectory, buildConfiguration.requirejs.outputFile ), optimzedRequireJs );

        if ( buildConfiguration.requirejs.generateBuildHtml ) {
          Util.assert( grunt.file.isFile( path.join( sourceDirectory, 'index.html' ) ), 'no index.html file found' );
          originalSize += fs.statSync( path.join( sourceDirectory, 'index.html' ) ).size;

          const indexHTML = grunt.file.read( path.join( sourceDirectory, 'index.html' ) );
          const head = Util.getStringFrom( '<head>', '</head>', indexHTML );
          const bodyStart = Util.getStringFrom( '<body', '>', indexHTML );

          Generator.registerRunTimeReplacementValue( 'BUILD_HEAD', head );
          Generator.registerRunTimeReplacementValue( 'BUILD_BODY', bodyStart +
            '<script>\n' + optimzedRequireJs + '\n</script>\n' + '</body>' );

          const endFile = path.relative( Util.REPO_PATH, path.join( buildDirectory, 'index.html' ) );

          Generator.generateFile( 'templates/index-build-template.html', endFile );
          newSize = fs.statSync( path.join( buildDirectory, 'index.html' ) ).size;
        }
        else {
          newSize = fs.statSync( path.join( buildDirectory, buildConfiguration.requirejs.outputFile ) ).size;
        }
      }

      grunt.log.writeln( '\n\nFinished...\n' );
      grunt.log.writeln( `Original Size: ${ originalSize } bytes` );
      grunt.log.writeln( `Minified Size: ${ newSize } bytes` );
      grunt.log.writeln( `Saved ${ ( originalSize - newSize ) } bytes (${ ( ( originalSize - newSize ) / originalSize * 100 ).toFixed( 2 ) }% saved)` );

      // If provided, run the postBuild command after building.
      if ( buildConfiguration.postBuild ) shell.exec( UserConfig.BUILD_RC.postBuild );
    }

    /**
     * Minifies the given JS code using Terser.
     * See https://terser.org/docs/api-reference for more documentation.
     * @public
     *
     * @param {string} code - code to minify
     * @param {Object} options
     * @returns {string} - the minified code
     */
    static minify( code, options ) {
      options = {
        ...MINIFY_DEFAULTS,

        // override the defaults with the passed in options
        ...options
      };

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
          preamble: `// Copyright © ${ Generator.getValue( 'AUTHOR' ) }. All rights reserved.\n\n` +
                    '/**\n' +
                    ` * @license ${ Generator.getValue( 'REPO_NAME' ) } ${ Generator.getValue( 'VERSION' ) }\n` +
                    ` * Released under ${ Generator.getValue( 'LICENSE' ) }\n` +
                    ' */'
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
     * @param {Object} [options]
     * @returns {Promise.<string>} - The combined JS output from the optimizer
     */
    static optimizeAMD( options ) {
      let output;
      let originalSize = 0;
      // All options are documented at https://github.com/requirejs/r.js/blob/master/build/example.build.js
      const config = {

        // Includes a require.js stub called almond, so that we don't have to include the full require.js runtime
        // inside of builds. This helps reduce file size, and the rest of require.js isn't needed.
        // See https://github.com/requirejs/almond for more about specifying name=almond
        name: 'almond',
        optimize: 'none',

        // {Object|boolean} - See https://github.com/requirejs/r.js/blob/master/build/example.build.js for the wrap
        // documentation, as it lists all of the available options.
        wrap: false,

        // Avoid optimization names that are outside the baseUrl, see http://requirejs.org/docs/optimization.html#pitfalls
        paths: { almond: process.cwd() + '/node_modules/almond/almond' },

        // JS config file
        mainConfigFile: options.configFile,
        onBuildRead: ( moduleName, path, contents ) => {
          originalSize += fs.statSync( path ).size;

          return this.transpile( contents, {
            compact: false,
            plugins: [ [ "@babel/plugin-proposal-object-rest-spread", { "loose": true, "useBuiltIns": true } ] ],
            presets: null
          } );
        },

        // optimized output file
        out( js, sourceMap ) { output = js; },

        // turn on preservation of comments that have a license in them
        preserveLicenseComments: false,
        optimizeAllPluginResources: true,
        inlineText: true,
        insertRequire: [ options.mainEntry ],
        ...options.overrideOptions
      };
      return new Promise( ( resolve, reject ) => {

        requirejs.optimize( config, ( buildResponse ) => {
          resolve( { code: output, originalSize: originalSize } );
        }, ( err ) => {
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
        presets: [ [ path.join( process.cwd(), '/node_modules/@babel/preset-env' ), {
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