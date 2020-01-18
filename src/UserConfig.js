// Copyright © 2019-2020 Brandon Li. All rights reserved.

/**
 * Utility class for referencing, validating, and parsing user-specific configuration values.
 *
 * User-specific configuration values are generalized and depend on the user and the environment. For instance,
 * each package.json of every user will be slightly different. Each key of package.json is a user-specific option and
 * determines Generator values.
 *
 * Contains methods for validating user configuration value(s). These are placed into methods so that they are only
 * validated on the command that needs the value(s) instead of every time this module is loaded. If any configuration
 * options weren't implemented correctly, will provide a helpful error message to guide the user to correct it.
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