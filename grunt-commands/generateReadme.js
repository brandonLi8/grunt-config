// Copyright © 2019 Brandon Li. All rights reserved.

/**
 * Generates a .README.md file in the Root directory using a template (../templates/readme-template.md)
 *
 * Test for `grunt generate-readme` found at ../tests/readmeTest.md (since the readme for this repo is custom)
 *
 * NOTE: package.json must be correctly implemented for this to work.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

// modules
const assert = require( './helpers/assert' );
const grunt = require( 'grunt' );
const replaceAll = require( './helpers/replaceAll' );


/**
 * @param {object} packageObject - object literal of package.JSON
 */
module.exports = packageObject => {
  'use strict';

  let readme = grunt.file.read( '../templates/readme-template.md' );

  //========================================================================================
  // Replace the year - not part of package.json.
  readme = replaceAll( readme, '{{CURRENT_YEAR}}', new Date().getFullYear() );


  //========================================================================================
  // Replace author traits.
  assert( packageObject.author && package.author.email && packageObject.author.email !== null,
    `Package.json should contain an author key-value pairing with a name and a email specified. Something like:

    "author": {
      "name": "Brandon Li",
      "email": "brandon.li820@gmail.com"
    }` );
  readme = replaceAll( readme, '{{AUTHOR}}', packageObject.author.name );
  readme = replaceAll( readme, '{{AUTHOR_EMAIL}}', packageObject.author.email );


  //========================================================================================
  // Replace repo name (ex: grunt-config)
  assert( packageObject.name!== null,
    `Package.json should contain a 'name' key-value paring. Something like:

    "name": "grunt-config"` );
  readme = replaceAll( readme, '{{NAME}}', packageObject.name );


  //========================================================================================
  // Replace repo description
  assert( packageObject.description !== null,
    `Package.json should contain a description key-value paring. Something like:

    "description": "this repo does ..."` );
  readme = replaceAll( readme, '{{DESCRIPTION}}', packageObject.description );


  //========================================================================================
  // Replace repo homepage
  assert( packageObject.homepage !== null,
    `Package.json should contain a homepage key-value paring. Something like:

    "homepage": "https://..."` );
  readme = replaceAll( readme, '{{HOMEPAGE}}', packageObject.homepage );


  //========================================================================================
  // Replace repo url
  assert( packageObject.repository && packageObject.repository.url !== null,
    `Package.json should contain a package key-value paring. Something like:

    "repository": {
      "type": "git",
      "url": "https://github.com/brandonLi8/grunt-config.git"
    },` );
  readme = replaceAll( readme, '{{REPO_URL}}', packageObject.repository.url );


  //========================================================================================
  // Replace License
  // NOTE: License link is not apart of package.json. It is rather derived from the repository url.
  // Your License should be in the root directory under the file LICENSE
  readme = replaceAll( readme, '{{LICENSE}}', packageObject.repository.url.replace( '.git', '/LICENSE' ) );

  //========================================================================================

  // Write to the repository's root directory.
  grunt.file.write( './README.md', readme );

  grunt.log.write( 'README successfully generated!' );
};