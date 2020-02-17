"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _extendableBuiltin(cls) {
  function ExtendableBuiltin() {
    var instance = Reflect.construct(cls, Array.from(arguments));
    Object.setPrototypeOf(instance, Object.getPrototypeOf(this));
    return instance;
  }

  ExtendableBuiltin.prototype = Object.create(cls.prototype, {
    constructor: {
      value: cls,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });

  if (Object.setPrototypeOf) {
    Object.setPrototypeOf(ExtendableBuiltin, cls);
  } else {
    ExtendableBuiltin.__proto__ = cls;
  }

  return ExtendableBuiltin;
}

var RetryCountExceededException = function (_extendableBuiltin2) {
  _inherits(RetryCountExceededException, _extendableBuiltin2);

  function RetryCountExceededException(requestContext) {
    _classCallCheck(this, RetryCountExceededException);

    var _this = _possibleConstructorReturn(this, (RetryCountExceededException.__proto__ || Object.getPrototypeOf(RetryCountExceededException)).call(this, 'Retry count has been exceeded'));

    _this.name = _this.constructor.name;
    _this.requestContext = requestContext;

    // Use V8's native method if available, otherwise fallback
    if ("captureStackTrace" in Error) {
      Error.captureStackTrace(_this, RetryCountExceededException);
    } else {
      _this.stack = new Error().stack;
    }
    return _this;
  }

  return RetryCountExceededException;
}(_extendableBuiltin(Error));

exports.default = RetryCountExceededException;