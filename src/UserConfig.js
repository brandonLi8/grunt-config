// Copyright © 2019-2020 Brandon Li. All rights reserved.

/**
 * Utility class for referencing, validating, and parsing user-specific configuration options. This class isn't directly
 * used by any of the Grunt commands in grunt-config/Gruntfile.
 *
 * User-specific configuration options are generalized values that the user of grunt-config configures. For instance,
 * each package.json of every user will be slightly different. Each key of package.json is a user-specific option.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

module.exports = ( () => {
  'use strict';

  // modules
  const Util = require( './Util' );

  class Config {

  }

  return Config;
} )();