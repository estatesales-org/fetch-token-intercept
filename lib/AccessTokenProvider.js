"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Provides a way for renewing access token with correct refresh token. It will automatically
 * dispatch a call to server with request provided via config. It also ensures that
 * access token is fetched only once no matter how many requests are trying to get
 * a renewed version of access token at the moment. All subsequent requests will be chained
 * to renewing fetch promise and resolved once the response is received.
 */
var AccessTokenProvider = function () {
  function AccessTokenProvider(fetch, config) {
    _classCallCheck(this, AccessTokenProvider);

    this.fetch = fetch;

    this.config = config;
    this.renewAccessTokenPromise = null;
    this.tokens = {
      refreshToken: null,
      accessToken: null
    };

    this.renew = this.renew.bind(this);
    this.authorize = this.authorize.bind(this);
    this.getAuthorization = this.getAuthorization.bind(this);
    this.clear = this.clear.bind(this);

    this.isAuthorized = this.isAuthorized.bind(this);
    this.resolveAccessToken = this.resolveAccessToken.bind(this);
    this.fetchAccessToken = this.fetchAccessToken.bind(this);
    this.handleFetchAccessTokenResponse = this.handleFetchAccessTokenResponse.bind(this);
    this.handleAccessToken = this.handleAccessToken.bind(this);
    this.handleError = this.handleError.bind(this);
  }

  /**
   * Renews current access token with provided refresh token
   */


  _createClass(AccessTokenProvider, [{
    key: "renew",
    value: function renew() {
      // if token resolver is not authorized it should just resolve
      if (!this.isAuthorized()) {
        return Promise.resolve();
      }

      // if we are not running token promise, start it
      if (!this.renewAccessTokenPromise) {
        this.renewAccessTokenPromise = new Promise(this.resolveAccessToken);
      }

      // otherwise just return existing promise
      return this.renewAccessTokenPromise;
    }

    /**
     * Authorizes intercept library with given refresh token
     * @param refreshToken
     * @param accessToken
     */

  }, {
    key: "authorize",
    value: function authorize(refreshToken, accessToken) {
      this.tokens = _extends({}, this.tokens, { refreshToken: refreshToken, accessToken: accessToken });
    }

    /**
     * Returns current authorization for fetch interceptor
     * @returns {{accessToken: string, refreshToken: string}}
     */

  }, {
    key: "getAuthorization",
    value: function getAuthorization() {
      return this.tokens;
    }

    /**
     * Clears authorization tokens. Call this to effectively log out user from fetch interceptor.
     */

  }, {
    key: "clear",
    value: function clear() {
      this.tokens.accessToken = null;
      this.tokens.refreshToken = null;
    }
  }, {
    key: "isAuthorized",
    value: function isAuthorized() {
      return this.tokens.refreshToken !== null;
    }
  }, {
    key: "fetchAccessToken",
    value: function fetchAccessToken(tokenRequest) {
      var fetch = this.fetch;

      return fetch(tokenRequest);
    }
  }, {
    key: "handleFetchAccessTokenResponse",
    value: function handleFetchAccessTokenResponse(response) {
      this.renewAccessTokenPromise = null;

      if (this.config.isResponseUnauthorized(response)) {
        this.clear();
        return null;
      }

      return this.config.parseAccessToken(response);
    }
  }, {
    key: "handleAccessToken",
    value: function handleAccessToken(accessToken, resolve) {
      this.tokens = _extends({}, this.tokens, { accessToken: accessToken });

      if (this.config.onAccessTokenChange) {
        this.config.onAccessTokenChange(accessToken);
      }

      resolve(accessToken);
    }
  }, {
    key: "handleError",
    value: function handleError(error, reject) {
      this.renewAccessTokenPromise = null;
      this.clear();

      reject(error);
    }
  }, {
    key: "resolveAccessToken",
    value: function resolveAccessToken(resolve, reject) {
      var _this = this;

      var refreshToken = this.tokens.refreshToken;
      var createAccessTokenRequest = this.config.createAccessTokenRequest;


      return Promise.resolve(createAccessTokenRequest(refreshToken)).then(this.fetchAccessToken).then(this.handleFetchAccessTokenResponse).then(function (token) {
        return _this.handleAccessToken(token, resolve);
      }).catch(function (error) {
        return _this.handleError(error, reject);
      });
    }
  }]);

  return AccessTokenProvider;
}();

exports.default = AccessTokenProvider;