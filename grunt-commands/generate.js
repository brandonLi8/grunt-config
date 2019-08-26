// Copyright © 2019 Brandon Li. All rights reserved.

/**
 * Generates a file by using a template and replacing template strings (e.g. {{REPO}})
 *
 * NOTE: package.json must be correctly implemented for this to work.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

// modules
const assert = require( './helpers/assert' );
const grunt = require( 'grunt' );

/**
 * @param {object} packageObject - object literal of package.JSON
 * @param {string} templatePath - path to the template file
 * @param {string} writePath - path to the file (doesn't have to exist) to write to
 */
module.exports = ( packageObject, templatePath, writePath ) => {
  'use strict';

  assert( !packageObject || Object.getPrototypeOf( packageObject ) === Object.prototype,
    `Extra prototype on Options: ${packageObject}` );
  assert( typeof templatePath === 'string', `invalid templatePath: ${templatePath}` );
  assert( typeof writePath === 'string', `invalid writePath: ${writePath}` );

  // get the template file
  let template = grunt.file.read( templatePath );

  // Create an array of Object literals that map a template string to a value (to replace with)
  // Optional assert to check that package.json was implemented correctly.
  const replacementStrings = {

    '{{CURRENT_YEAR}}': {
      value: `${ new Date().getFullYear() }`
    },


    '{{AUTHOR}}': {
      value: ( packageObject.author && packageObject.author.name ) ? packageObject.author.name : null,
      failExample: `
        "author": {
          "name": "Brandon Li",
          "email": "brandon.li820@gmail.com"
        }`
    },

    '{{AUTHOR_EMAIL}}': {
      value: ( packageObject.author && packageObject.author.email ) ? packageObject.author.email : null,
      failExample: `
        "author": {
          "name": "Brandon Li",
          "email": "brandon.li820@gmail.com"
        }`
    },

    '{{REPO}}': {
      value: packageObject.name,
      failExample: '\n        "name": "grunt-config"'
    },

    '{{DESCRIPTION}}': {
      value: packageObject.description,
      failExample: '\n        "description": "this repo does..."'
    },

    '{{HOMEPAGE}}': {
      value: packageObject.homepage,
      failExample: '\n        "homepage": "https://..."'
    },

    '{{GIT_URL}}': {
      value: ( packageObject.repository && packageObject.repository.url ) ? packageObject.repository.url : null,
      failExample: `
        "repository": {
          "type": "git",
          "url": "https://github.com/brandonLi8/grunt-config.git"
        },`
    },

    // NOTE: License link is not apart of package.json. It is rather derived from the repository url.
    // Your License should be in the root directory under the file LICENSE
    '{{LICENSE}}': {
      value: ( packageObject.repository && packageObject.repository.url ) ?
        packageObject.repository.url.replace( '.git', '/LICENSE' ) :
        null,
      failExample: `
        "repository": {
          "type": "git",
          "url": "https://github.com/brandonLi8/grunt-config.git"
        },`
    },

    "{{ISSUE_URL}}": {
      value: ( packageObject.bugs && packageObject.bugs.url ) ? packageObject.bugs.url : null,
      failExample: `
        "bugs": {
          "url": "https://github.com/brandonLi8/grunt-config/issues",
          "email": "brandon.li820@gmail.com"
        },`
    }




  }
  grunt.log.write(  grunt.option( 'test' ) === true )

  Object.keys( replacementStrings ).forEach( replacementString => {

    let obj = replacementStrings[ replacementString ];

    if ( template.includes( replacementString ) ) {


      assert( obj && typeof obj.value === 'string', `

package.json was not implemented correctly when replacing ${ replacementString }.
Double check that you have something like
${ obj.failExample || 'something went wrong :( unable to find example' }

inside your package.json.` );

      template = template.replace( new RegExp( replacementString.replace( /[-\\^$*+?.()|[\]{}]/g, '\\$&' ), 'g' ), obj.value );

    }

  } );


  //========================================================================================

  // Write to the repository's root directory.
  grunt.file.write( writePath, template );

  grunt.log.write( '\n\nSuccessfully generated!' );
};