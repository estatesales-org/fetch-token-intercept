"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isResponseOk = isResponseOk;
exports.isResponseUnauthorized = isResponseUnauthorized;
var STATUS_UNAUTHORIZED = exports.STATUS_UNAUTHORIZED = 401;
var STATUS_OK = exports.STATUS_OK = 200;

function isResponseStatus(response, status) {
  if (!response) {
    return false;
  }

  return response.status === status;
}

function isResponseOk(response) {
  return isResponseStatus(response, STATUS_OK);
}

function isResponseUnauthorized(response) {
  return isResponseStatus(response, STATUS_UNAUTHORIZED);
}