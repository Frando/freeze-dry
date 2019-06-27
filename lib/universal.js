'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.blobToDataURL = exports.responseToBlob = exports.blobToText = exports.Blob = undefined;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var blobToText = exports.blobToText = function () {
  var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(blob) {
    var text;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            text = void 0;

            if (!(blob instanceof Blob)) {
              _context.next = 5;
              break;
            }

            text = blob.toBuffer().toString();
            _context.next = 8;
            break;

          case 5:
            _context.next = 7;
            return new Promise(function (resolve, reject) {
              var reader = new FileReader();
              reader.onload = function () {
                return resolve(reader.result);
              };
              reader.onerror = function () {
                return reject(reader.error);
              };
              reader.readAsText(blob); // TODO should we know&tell which encoding to use?
            });

          case 7:
            text = _context.sent;

          case 8:
            return _context.abrupt('return', text);

          case 9:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  return function blobToText(_x) {
    return _ref.apply(this, arguments);
  };
}();

var responseToBlob = exports.responseToBlob = function () {
  var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(resourceOrResponse) {
    var buf;
    return _regenerator2.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            if (!resourceOrResponse.arrayBuffer) {
              _context2.next = 7;
              break;
            }

            _context2.next = 3;
            return resourceOrResponse.arrayBuffer();

          case 3:
            buf = _context2.sent;
            return _context2.abrupt('return', new Blob([buf]));

          case 7:
            if (!(typeof resourceOrResponse.blob === 'function')) {
              _context2.next = 13;
              break;
            }

            _context2.next = 10;
            return resourceOrResponse.blob();

          case 10:
            _context2.t0 = _context2.sent;
            _context2.next = 14;
            break;

          case 13:
            _context2.t0 = resourceOrResponse.blob;

          case 14:
            return _context2.abrupt('return', _context2.t0);

          case 15:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, this);
  }));

  return function responseToBlob(_x2) {
    return _ref2.apply(this, arguments);
  };
}();

var blobToDataURL = exports.blobToDataURL = function () {
  var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(blob) {
    var base64String;
    return _regenerator2.default.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            if (!blob.toBuffer) {
              _context3.next = 5;
              break;
            }

            base64String = blob.toBuffer().toString('base64');
            return _context3.abrupt('return', 'data:' + blob.type + ';base64,' + base64String);

          case 5:
            return _context3.abrupt('return', (0, _package.blobToDataURL)(blob));

          case 6:
          case 'end':
            return _context3.stop();
        }
      }
    }, _callee3, this);
  }));

  return function blobToDataURL(_x3) {
    return _ref3.apply(this, arguments);
  };
}();

var _package = require('./package');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Blob = exports.Blob = function () {
  function Blob(strings, opts) {
    (0, _classCallCheck3.default)(this, Blob);

    this.opts = opts || {};
    this.type = this.opts.type;
    var buf = Buffer.alloc(0);
    strings.forEach(function (str) {
      buf = Buffer.concat([buf, Buffer.from(str)]);
    });
    this.buf = buf;
  }

  (0, _createClass3.default)(Blob, [{
    key: 'toBuffer',
    value: function toBuffer() {
      return this.buf;
    }
  }]);
  return Blob;
}();