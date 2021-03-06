'use strict';

var _ = require('lodash');

// The name mappings from HTTP methods to CRUDL functions
var verbMappings = {
  create: 'POST',
  read: 'GET',
  update: 'PUT',
  delete: 'DELETE',
  list: 'GET'
};

/**
 * Should a request try to use a HTTP verb that the adapter is not supporting
 * we need to return this header in the response
 *
 * Example result, "POST, GET, DELETE"
 *
 * @param  {Object} adapter
 * @return {String}
 */
function generateAllowHeader (adapter) {
  return _.reduce(_.keys(verbMappings), function (sum, n) {
    if (adapter.hasOwnProperty(n)) {
      // If this is the first time adding a string, do not insert comma
      return sum ? (sum + ', ' + verbMappings[n]) : verbMappings[n];
    } else {
      return sum;
    }
  }, '');
}


/**
 * Generate a function that can be used to check support for a method on
 * a given endpoint
 * @param  {Object}   opts
 * @return {Function}
 */
module.exports = function checkEndpointSupport (opts) {
  return function _genEndpointMiddleware (fnType) {
    return function _isSupported (req, res, next) {
      if (!opts.adapter.hasOwnProperty(fnType)) {
        // Adapter does not support this operation, e.g PUT /users
        // but might support GET /users
        res.set('Allow', generateAllowHeader(opts.adapter));

        // Return a 405 to note that the action is not supported
        res.status(405).json({
          msg: 'action not supported: ' + req.method + ' ' + req.originalUrl
        });
      } else {
        next();
      }
    };
  };
};
