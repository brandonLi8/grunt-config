
  grunt.registerTask( 'build', 'Generates Build', createTask( ( src, buildLocation ) => {

    var Terser = require( "terser" );
    const path = require('path');

    grunt.file.delete( './dist' );
    grunt.file.mkdir( './dist' );
    var fs = require("fs"); //Load the filesystem module

    let originalSize = 0;
    let newSize = 0;

    function callback( abspath, rootdir, subdir, filename)  {

      const code = grunt.file.read( abspath );
      var options = {
        compress: {
            global_defs: {
              require: false,
            },
            passes: 3,
            drop_console: false,
        },
        mangle: {
          reserved: [ 'require' ],
        },
        output: {
          beautify: false,
          preamble:
`// Copyright © ${ new Date().getFullYear() } ${ packageObject.author.name }. All rights reserved.
// Minified distribution version - ${ packageObject.name } ${ packageObject.version } - ${ packageObject.license }.`
        }
      };
      const minify = Terser.minify( code, options );

      grunt.file.write( './dist' + ( subdir ? `/${subdir}/` : '/' ) + filename, minify.code );

      originalSize += fs.statSync( abspath ).size;
      newSize += fs.statSync( './dist' + ( subdir ? `/${subdir}/` : '/' ) + filename).size;
    }

    grunt.file.recurse(src, callback)

    grunt.log.writeln( '\n\nFinished...\n' );

    grunt.log.writeln( `Original Size: ${ originalSize } bytes` );
    grunt.log.writeln( `Minified Size: ${ newSize } bytes` );
    grunt.log.writeln( `Saved ${ ( originalSize - newSize ) } bytes (${( ( originalSize - newSize ) / originalSize * 100 ).toFixed( 2 ) }% saved)`)
  } ) );