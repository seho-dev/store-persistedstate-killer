import { pbkdf2Sync } from 'crypto';

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

var Crypto = function Crypto(options, ctx) {
  var _this$ctx;

  _classCallCheck(this, Crypto);

  this.options = options || null;
  this.ctx = ctx || null;
  var title = ((_this$ctx = this.ctx) === null || _this$ctx === void 0 ? void 0 : _this$ctx.app.head.title) || '';
  var key = navigator.userAgent.toLowerCase() || '';
  var salt = title || '';
  this.key = pbkdf2Sync(key, salt, 64, 64, 'sha512').toString('base64');
};

var crypto = /*#__PURE__*/Object.freeze({
  __proto__: null,
  'default': Crypto
});

export { crypto };
