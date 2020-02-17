'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseBearer = parseBearer;
var bearerRegex = /^Bearer (.+)$/;

function parseBearer(authorizationHeaderValue) {
  if (!authorizationHeaderValue || typeof authorizationHeaderValue !== 'string') {
    return null;
  }

  var matches = authorizationHeaderValue.match(bearerRegex);
  // matches contains whole value and group, we are interested in group part
  if (!matches || matches.length < 2) {
    return null;
  }

  var token = matches[1];
  if (!token) {
    return null;
  }

  return token;
}