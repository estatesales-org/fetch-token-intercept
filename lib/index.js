'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isResponseUnauthorized = exports.interceptor = undefined;
exports.attach = attach;
exports.init = init;
exports.configure = configure;
exports.authorize = authorize;
exports.getAuthorization = getAuthorization;
exports.clear = clear;

var _environment = require('./services/environment');

var _http = require('./services/http');

var _FetchInterceptor = require('./FetchInterceptor');

var _FetchInterceptor2 = _interopRequireDefault(_FetchInterceptor);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var interceptor = exports.interceptor = null;

function attach(env) {
  if (!env.fetch) {
    throw Error('No fetch available. Unable to register fetch-token-intercept');
  }

  if (interceptor) {
    // throw Error('You should attach only once.');
    return;
  }

  // for now add default interceptor
  exports.interceptor = interceptor = new _FetchInterceptor2.default(env.fetch);

  // monkey patch fetch
  // eslint-disable-next-line no-unused-vars
  var fetchWrapper = function fetchWrapper(fetch) {
    return function () {
      var _interceptor;

      return (_interceptor = interceptor).intercept.apply(_interceptor, arguments);
    };
  };
  // eslint-disable-next-line no-param-reassign
  env.fetch = fetchWrapper(env.fetch);
}

function init() {
  if ((0, _environment.isReactNative)()) {
    attach(global);
  } else if ((0, _environment.isWorker)()) {
    attach(self);
  } else if ((0, _environment.isWeb)()) {
    attach(window);
  } else if ((0, _environment.isNode)()) {
    attach(global);
  } else {
    throw new Error('Unsupported environment for fetch-token-intercept');
  }
}

function configure(config) {
  interceptor.configure(config);
}

function authorize() {
  var _interceptor2;

  (_interceptor2 = interceptor).authorize.apply(_interceptor2, arguments);
}

function getAuthorization() {
  return interceptor.getAuthorization();
}

function clear() {
  return interceptor.clear();
}

exports.isResponseUnauthorized = _http.isResponseUnauthorized;