'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _const = require('./const');

var _http = require('./services/http');

var http = _interopRequireWildcard(_http);

var _TokenExpiredException = require('./services/TokenExpiredException');

var _TokenExpiredException2 = _interopRequireDefault(_TokenExpiredException);

var _RetryCountExceededException = require('./services/RetryCountExceededException');

var _RetryCountExceededException2 = _interopRequireDefault(_RetryCountExceededException);

var _AccessTokenProvider = require('./AccessTokenProvider');

var _AccessTokenProvider2 = _interopRequireDefault(_AccessTokenProvider);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Provides a default implementation for intercepting fetch requests. It will try to resolve
 * unauthorized responses by renewing the access token and repeating the initial request.
 */
var FetchInterceptor = function () {
  function FetchInterceptor(fetch) {
    _classCallCheck(this, FetchInterceptor);

    // stores reference to vanilla fetch method
    this.fetch = fetch;

    this.config = {
      fetchRetryCount: 1,
      createAccessTokenRequest: null,
      shouldIntercept: function shouldIntercept() {
        return true;
      },
      shouldInvalidateAccessToken: function shouldInvalidateAccessToken() {
        return false;
      },
      isResponseUnauthorized: http.isResponseUnauthorized,
      parseAccessToken: null,
      authorizeRequest: null,
      onAccessTokenChange: null,
      onResponse: null
    };

    this.intercept = this.intercept.bind(this);

    this.resolveIntercept = this.resolveIntercept.bind(this);
    this.fetchWithRetry = this.fetchWithRetry.bind(this);
    this.isConfigValid = this.isConfigValid.bind(this);
    this.createRequestContext = this.createRequestContext.bind(this);
    this.createRequest = this.createRequest.bind(this);
    this.shouldIntercept = this.shouldIntercept.bind(this);
    this.authorizeRequest = this.authorizeRequest.bind(this);
    this.shouldFetch = this.shouldFetch.bind(this);
    this.fetchRequest = this.fetchRequest.bind(this);
    this.shouldInvalidateAccessToken = this.shouldInvalidateAccessToken.bind(this);
    this.invalidateAccessToken = this.invalidateAccessToken.bind(this);
    this.handleUnauthorizedRequest = this.handleUnauthorizedRequest.bind(this);
    this.handleResponse = this.handleResponse.bind(this);
  }

  /**
   * Configures fetch interceptor with given config object. All required properties can optionally
   * return a promise which will be resolved by fetch interceptor automatically.
   *
   * @param config
   *
   * (Required) Prepare fetch request for renewing new access token
   *   createAccessTokenRequest: (refreshToken) => request,
   *
   * (Required) Parses access token from access token response
   *   parseAccessToken: (response) => accessToken,
   *
   * (Required) Defines whether interceptor will intercept this request or just let it pass through
   *   shouldIntercept: (request) => boolean,
   *
   * (Required) Defines whether access token will be invalidated after this response
   *   shouldInvalidateAccessToken: (response) => boolean,
   *
   * (Required) Adds authorization for intercepted requests
   *   authorizeRequest: (request, accessToken) => authorizedRequest,
   *
   * Checks if response should be considered unauthorized (by default only 401 responses are
   * considered unauthorized. Override this method if you need to trigger token renewal for
   * other response statuses.
   *   isResponseUnauthorized: (response) => boolean,
   *
   * Number of retries after initial request was unauthorized
   *   fetchRetryCount: 1,
   *
   * Event invoked when access token has changed
   *   onAccessTokenChange: null,
   *
   * Event invoked when response is resolved
   *   onResponse: null,
   *
   */


  _createClass(FetchInterceptor, [{
    key: 'configure',
    value: function configure(config) {
      this.config = _extends({}, this.config, config);

      if (!this.isConfigValid(this.config)) {
        throw new Error(_const.ERROR_INVALID_CONFIG);
      }

      this.accessTokenProvider = new _AccessTokenProvider2.default(this.fetch, this.config);
    }

    /**
     * Authorizes fetch interceptor with given refresh token
     * @param refreshToken
     * @param accessToken
     */

  }, {
    key: 'authorize',
    value: function authorize(refreshToken, accessToken) {
      this.accessTokenProvider.authorize(refreshToken, accessToken);
    }

    /**
     * Returns current authorization for fetch fetchInterceptor
     * @returns {{accessToken: string, refreshToken: string}}
     */

  }, {
    key: 'getAuthorization',
    value: function getAuthorization() {
      return this.accessTokenProvider.getAuthorization();
    }

    /**
     * Clears authorization tokens. Call this to effectively log out user from fetch interceptor.
     */

  }, {
    key: 'clear',
    value: function clear() {
      this.accessTokenProvider.clear();
    }

    /**
     * Main intercept method, you should chain this inside wrapped fetch call
     * @param args Args initially provided to fetch method
     * @returns {Promise} Promise which resolves the same way as fetch would
     */

  }, {
    key: 'intercept',
    value: function intercept() {
      var _this = this;

      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return new Promise(function (resolve, reject) {
        return _this.resolveIntercept.apply(_this, [resolve, reject].concat(args));
      });
    }
  }, {
    key: 'isConfigValid',
    value: function isConfigValid() {
      return this.config.shouldIntercept && this.config.authorizeRequest && this.config.createAccessTokenRequest && this.config.parseAccessToken;
    }
  }, {
    key: 'resolveIntercept',
    value: function resolveIntercept(resolve, reject) {
      var _this2 = this;

      var _accessTokenProvider$ = this.accessTokenProvider.getAuthorization(),
          accessToken = _accessTokenProvider$.accessToken;

      for (var _len2 = arguments.length, args = Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
        args[_key2 - 2] = arguments[_key2];
      }

      var requestContext = this.createRequestContext([].concat(args), resolve, reject);

      // if access token is not resolved yet
      if (!accessToken) {
        return this.accessTokenProvider.renew().then(function () {
          return _this2.fetchWithRetry(requestContext);
        }).catch(reject);
      }

      // attempt normal fetch operation
      return this.fetchWithRetry(requestContext).catch(reject);
    }
  }, {
    key: 'fetchWithRetry',
    value: function fetchWithRetry(requestContext) {
      // prepare initial request context
      return Promise.resolve(requestContext)
      // create request
      .then(this.createRequest)
      // resolve should intercept flag, when false, step is skipped
      .then(this.shouldIntercept)
      // authorize request
      .then(this.authorizeRequest)
      // last minute check if fetch should be performed
      // this is as close as it gets to canceling events since
      // fetch spec does not support cancel at the moment
      .then(this.shouldFetch)
      // perform fetch
      .then(this.fetchRequest)
      // check if response invalidates current access token
      .then(this.shouldInvalidateAccessToken)
      // perform token invalidation if neccessary
      .then(this.invalidateAccessToken)
      // handle unauthorized response by requesting a new access token and
      // repeating a request
      .then(this.handleResponse).catch(this.handleUnauthorizedRequest);
    }

    /**
     * Request context provides a common object for storing information about request's and response's
     * results while it passes through a token interception pipeline. It's provided as input for each
     * stage method in the pipeline and can be used to store results of that stage or read results of
     * previous stages. Each stage should modify the context accordingly and simple return context
     * when it's finished.
     * @param fetchArgs
     * @param fetchResolve
     * @param fetchReject
     */

  }, {
    key: 'createRequestContext',
    value: function createRequestContext(fetchArgs, fetchResolve, fetchReject) {
      return {
        request: null,
        response: null,
        shouldIntercept: false,
        shouldInvalidateAccessToken: false,
        shouldWaitForTokenRenewal: false,
        shouldFetch: true,
        accessToken: null,
        fetchCount: 0,
        fetchArgs: fetchArgs,
        fetchResolve: fetchResolve,
        fetchReject: fetchReject
      };
    }
  }, {
    key: 'createRequest',
    value: function createRequest(requestContext) {
      var fetchArgs = requestContext.fetchArgs;

      var request = new (Function.prototype.bind.apply(Request, [null].concat(_toConsumableArray(fetchArgs))))();

      return _extends({}, requestContext, {
        request: request
      });
    }
  }, {
    key: 'shouldIntercept',
    value: function shouldIntercept(requestContext) {
      var request = requestContext.request;


      return Promise.resolve(this.config.shouldIntercept(request)).then(function (shouldIntercept) {
        return _extends({}, requestContext, { shouldIntercept: shouldIntercept });
      });
    }
  }, {
    key: 'authorizeRequest',
    value: function authorizeRequest(requestContext) {
      var shouldIntercept = requestContext.shouldIntercept;


      if (!shouldIntercept) {
        return requestContext;
      }

      var request = requestContext.request;

      var _accessTokenProvider$2 = this.accessTokenProvider.getAuthorization(),
          accessToken = _accessTokenProvider$2.accessToken;

      var authorizeRequest = this.config.authorizeRequest;


      if (request && accessToken) {
        return Promise.resolve(authorizeRequest(request, accessToken)).then(function (authorizedRequest) {
          return _extends({}, requestContext, { accessToken: accessToken, request: authorizedRequest });
        });
      }

      return requestContext;
    }
  }, {
    key: 'shouldFetch',
    value: function shouldFetch(requestContext) {
      var request = requestContext.request;

      // verifies all outside conditions from config are met

      if (!this.config.shouldFetch) {
        return requestContext;
      }

      return Promise.resolve(this.config.shouldFetch(request)).then(function (shouldFetch) {
        return _extends({}, requestContext, { shouldFetch: shouldFetch });
      });
    }
  }, {
    key: 'fetchRequest',
    value: function fetchRequest(requestContext) {
      var shouldFetch = requestContext.shouldFetch;


      if (!shouldFetch) {
        return requestContext;
      }

      var request = requestContext.request,
          fetchCount = requestContext.fetchCount;
      var fetchRetryCount = this.config.fetchRetryCount;

      // verifies that retry count has not been exceeded

      if (fetchCount > fetchRetryCount) {
        throw new _RetryCountExceededException2.default(requestContext);
      }

      var fetch = this.fetch;

      return Promise.resolve(fetch(request)).then(function (response) {
        return _extends({}, requestContext, {
          response: response,
          fetchCount: fetchCount + 1
        });
      });
    }
  }, {
    key: 'shouldInvalidateAccessToken',
    value: function shouldInvalidateAccessToken(requestContext) {
      var shouldIntercept = requestContext.shouldIntercept;


      if (!shouldIntercept) {
        return requestContext;
      }

      var response = requestContext.response;
      // check if response invalidates access token

      return Promise.resolve(this.config.shouldInvalidateAccessToken(response)).then(function (shouldInvalidateAccessToken) {
        return _extends({}, requestContext, { shouldInvalidateAccessToken: shouldInvalidateAccessToken });
      });
    }
  }, {
    key: 'invalidateAccessToken',
    value: function invalidateAccessToken(requestContext) {
      var shouldIntercept = requestContext.shouldIntercept,
          shouldInvalidateAccessToken = requestContext.shouldInvalidateAccessToken;
      var shouldWaitForTokenRenewal = this.config.shouldWaitForTokenRenewal;


      if (!shouldIntercept || !shouldInvalidateAccessToken) {
        return requestContext;
      }

      if (!shouldWaitForTokenRenewal) {
        this.accessTokenProvider.renew();
        return requestContext;
      }

      return Promise.resolve(this.accessTokenProvider.renew()).then(function () {
        return requestContext;
      });
    }
  }, {
    key: 'handleResponse',
    value: function handleResponse(requestContext) {
      var shouldIntercept = requestContext.shouldIntercept,
          response = requestContext.response,
          fetchResolve = requestContext.fetchResolve,
          fetchReject = requestContext.fetchReject;
      var isResponseUnauthorized = this.config.isResponseUnauthorized;

      // can only be empty on network errors

      if (!response) {
        return fetchReject();
      }

      if (shouldIntercept && isResponseUnauthorized(response)) {
        throw new _TokenExpiredException2.default(_extends({}, requestContext));
      }

      if (this.config.onResponse) {
        this.config.onResponse(response);
      }

      return fetchResolve(response);
    }
  }, {
    key: 'handleUnauthorizedRequest',
    value: function handleUnauthorizedRequest(error) {
      var _this3 = this;

      // if expired token, we try to resolve it and retry operation
      if (error instanceof _TokenExpiredException2.default) {
        var requestContext = error.requestContext;
        var fetchReject = requestContext.fetchReject;


        return Promise.resolve(this.accessTokenProvider.renew()).then(function () {
          return _this3.fetchWithRetry(requestContext);
        }).catch(fetchReject);
      }

      // if we failed to resolve token we just pass the last response
      if (error instanceof _RetryCountExceededException2.default) {
        var _requestContext = error.requestContext;
        var response = _requestContext.response,
            fetchResolve = _requestContext.fetchResolve;


        if (this.config.onResponse) {
          this.config.onResponse(response);
        }

        return fetchResolve(response);
      }

      // cannot be handled here
      throw new Error(error);
    }
  }]);

  return FetchInterceptor;
}();

exports.default = FetchInterceptor;