// Copyright © 2019 Brandon Li. All rights reserved.

/**
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

module.exports = ( () => {
  'use strict';

  // modules
  const fs = require( 'fs' );
  const grunt = require( 'grunt' );
  const shell = require( 'shelljs' ); // eslint-disable-line require-statement-match
  const Util = require( './Util' );
  const Generator = require( './Generator' );
  shell.config.silent = true;

  class Copyright {

    static updateCopyrightFile( filePath ) {
      Util.assert( shell.which( 'git' ), 'you must have git installed to update a copyright' );

      // https://stackoverflow.com/questions/2390199/finding-the-date-time-a-file-was-first-added-to-a-git-repository
      const startDate = shell.exec( `git log --diff-filter=A --follow --date=short --format=%cd -1 -- ${ filePath }` )
        .trim().split( '-' )[ 0 ] || Util.CURRENT_YEAR;

      const endDate = Util.CURRENT_YEAR;

      // Create the single date or date range to use in the copyright statement
      const dateString = startDate === endDate ? startDate : `${ startDate }-${ endDate }`;

      const fileText = fs.readFileSync( filePath, 'utf8' );

      // Infer the line separator for the platform
      const firstR = fileText.indexOf( '\r' );
      const firstN = fileText.indexOf( '\n' );
      const lineSeparator = firstR >= 0 && firstR < firstN ? '\r' : '\n';

      // Parse by line separator
      const fileLines = fileText.split( lineSeparator ); // splits using both unix and windows newlines

      const replacementValues = Generator.getReplacementValuesMapping();

      // Check if the first line is already correct
      const firstLine = fileLines[ 0 ];
      const copyrightLine = `// Copyright © ${ dateString } ${ replacementValues.AUTHOR }. All rights reserved.`;

      // Update the line
      if ( firstLine !== copyrightLine ) {
        if ( firstLine.indexOf( '// Copyright' ) === 0 ) {
          const concatted = [ copyrightLine ].concat( fileLines.slice( 1 ) );
          const newFileContents = concatted.join( lineSeparator );
          fs.writeFileSync( filePath, newFileContents );
          console.log( filePath + ', updated with ' + copyrightLine );
        }
        else {
          console.log( filePath + ' FIRST LINE WAS NOT COPYRIGHT: ' + firstLine );
        }
      }
    }
  }

  return Copyright;
} )();
// /**
//  * @public
//  * @param {string} repo - The repository of the file to update (should be a git root)
//  * @param {string} relativeFile - The filename relative to the repository root.
//  * @returns {Promise}
//  */
// module.exports = async ( repo, relativeFile ) => {

//   let startDate = ( await execute( 'git', [
//     'log', '--diff-filter=A', '--follow', '--date=short', '--format=%cd', '-1', '--', relativeFile
//   ], {
//     cwd: `../${repo}`
//   } ) ).trim().split( '-' )[ 0 ];

//   // There is a bug with the above git log command that sometimes yields a blank link as output
//   if ( startDate === '' ) {
//     startDate = '2002';
//   }

//   const endDate = ( await execute( 'git', [
//     'log', '--follow', '--date=short', '--format=%cd', '-1', '--', relativeFile
//   ], {
//     cwd: `../${repo}`
//   } ) ).trim().split( '-' )[ 0 ];

//   const absPath = `../${repo}/${relativeFile}`;


// };