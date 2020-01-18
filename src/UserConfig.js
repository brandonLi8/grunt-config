// Copyright © 2019-2020 Brandon Li. All rights reserved.

/**
 * Utility for referencing, validating, and parsing user-specific configuration options.
 *
 * User-specific configuration options are generalized values that depend on the user and environment. For instance,
 * each package.json of every user will be slightly different. Each key of package.json is a user-specific option and
 * determines Generator values.
 *
 * Contains methods for validating user configuration value(s). These are placed into methods so that they are only
 * validated on the command that needs the value(s).
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

module.exports = ( () => {
  'use strict';

  // modules
  const grunt = require( 'grunt' );
  const Util = require( './Util' );

  const Config = {

    PACKAGE_JSON: grunt.file.isFile( 'package.json' ) ? grunt.file.readJSON( 'package.json' ) : undefined,
    BUILD_RC: grunt.file.isFile( 'package.json' ) ? grunt.file.readJSON( 'package.json' ) : undefined,
    GITHUB_ACCESS_TOKEN: process.env.GITHUB_ACCESS_TOKEN


  }

  return Config;
} )();