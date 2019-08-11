// Copyright © 2019 Brandon Li. All rights reserved.

/**
 * Generates a .travis.yml file in the Root directory using a template (../templates/travis-template.yml)
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

// modules
const grunt = require( 'grunt' );
const replaceAll = require( './helpers/replaceAll' );


/**
 * @param {object} packageObject - object literal of package.JSON
 */
module.exports = packageObject => {
  'use strict';

  let defaultTravis = grunt.file.read( 'templates/travis-template.yml' );

  // Replace placeholders in the template.
  defaultTravis = replaceAll( defaultTravis, '{{CURRENT_YEAR}}', new Date().getFullYear() );
  defaultTravis = replaceAll( defaultTravis, '{{AUTHOR}}', packageObject.author.name );
  defaultTravis = replaceAll( defaultTravis, '{{TRAVIS_CLI}}', packageObject[ 'travis-cli' ] );
  defaultTravis = replaceAll( defaultTravis, '{{AUTHOR_EMAIL}}', packageObject.author.email );
  defaultTravis = replaceAll( defaultTravis, '{{REPO}}', packageObject.name );

  // Write to the repository's root directory.
  grunt.file.write( './.travis.yml', defaultTravis );
};
