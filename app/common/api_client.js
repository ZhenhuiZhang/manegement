var config = require('../../config');

var ApiClient = require('../utils/api-client');
var apiclient = new ApiClient({
    key: config.api_secret_key,
    url: config.api_server
});

exports = module.exports = apiclient;