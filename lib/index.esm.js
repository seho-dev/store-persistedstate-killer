import { randomBytes, pbkdf2Sync, createCipheriv, createDecipheriv } from 'crypto';

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

var Crypto = /*#__PURE__*/function () {
  function Crypto(options, ctx) {
    var _this$ctx;

    _classCallCheck(this, Crypto);

    this.options = options || null;
    this.ctx = ctx || null;
    this.cipher = null;
    this.decipher = null;
    this.iv = randomBytes(16);
    var title = ((_this$ctx = this.ctx) === null || _this$ctx === void 0 ? void 0 : _this$ctx.app.head.title) || '';
    var key = navigator.userAgent.toLowerCase() || '';
    var salt = title || '';
    this.key = pbkdf2Sync(key, salt, 64, 64, 'sha512').toString('base64').slice(0, 32);
  }

  _createClass(Crypto, [{
    key: "setKey",
    value: function setKey(key, salt, keyMixTimes, keyLength) {
      this.key = pbkdf2Sync(key, salt, keyMixTimes || 64, keyLength || 64, 'sha512').toString('base64').slice(0, 32);
    }
    /**
     * @name 加密
     * @template T
     * @param {T} data
     * @return {*}  {(string | null)}
     * @memberof Crypto
     */

  }, {
    key: "encrypt",
    value: function encrypt(data) {
      var _this$options;

      // 如果当前是debug模式，就不加密，直接返回原密钥
      if (((_this$options = this.options) === null || _this$options === void 0 ? void 0 : _this$options.mode) === 'debug') return data;

      try {
        var _this$options2;

        this.cipher = createCipheriv(((_this$options2 = this.options) === null || _this$options2 === void 0 ? void 0 : _this$options2.type) || 'aes-256-cbc', this.key, this.iv);
        var res = this.cipher.update(data, 'utf-8', 'base64');
        res += this.cipher["final"]('base64');
        return res;
      } catch (error) {
        console.log(error);
        return null;
      }
    }
    /**
     * @name 解密
     * @template T
     * @param {T} data
     * @return {*}  {(string | null)}
     * @memberof Crypto
     */

  }, {
    key: "decrypt",
    value: function decrypt(data) {
      var _this$options3;

      this.decipher = createDecipheriv(((_this$options3 = this.options) === null || _this$options3 === void 0 ? void 0 : _this$options3.type) || 'aes-256-cbc', this.key, this.iv);

      try {
        var res = this.decipher.update(data, 'base64', 'utf-8');
        res += this.decipher["final"]('utf-8');
        return res;
      } catch (error) {
        return null;
      }
    }
  }]);

  return Crypto;
}();

var crypto = /*#__PURE__*/Object.freeze({
  __proto__: null,
  'default': Crypto
});

export { crypto };
