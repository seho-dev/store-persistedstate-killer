import crypto$1 from 'crypto-js';

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
    this.iv = crypto$1.lib.WordArray.random(16);
    var title = ((_this$ctx = this.ctx) === null || _this$ctx === void 0 ? void 0 : _this$ctx.app.head.title) || '';
    var key = navigator.userAgent.toLowerCase() || '';
    var salt = title || '';
    this.key = crypto$1.PBKDF2(key, salt, {
      keySize: 64,
      iterations: 64
    });
  }

  _createClass(Crypto, [{
    key: "setKey",
    value: function setKey(key, salt, keyMixTimes, keyLength) {
      this.key = crypto$1.PBKDF2(key, salt, {
        keySize: keyLength | 64,
        iterations: keyMixTimes | 64
      });
    }
    /**
     * @name 加密
     * @template T
     * @param {T} data
     * @return {*}  {(string | null)}
     * @example
     *
     *     const res = encrypt('message')
     * @memberof Crypto
     */

  }, {
    key: "encrypt",
    value: function encrypt(data) {
      var _this$options;

      // 如果当前是debug模式，就不加密，直接返回原密钥
      if (((_this$options = this.options) === null || _this$options === void 0 ? void 0 : _this$options.mode) === 'debug') return data;

      try {
        var encrypted = crypto$1.AES.encrypt(data, this.key, {
          iv: this.iv,
          mode: crypto$1.mode.CBC,
          padding: crypto$1.pad.Pkcs7
        });
        return encrypted.toString();
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
     * @example
     *
     *     const res = decrypt('message', {parse: true})
     * @memberof Crypto
     */

  }, {
    key: "decrypt",
    value: function decrypt(data, options) {
      try {
        var decrypt = crypto$1.AES.decrypt(data, this.key, {
          iv: this.iv,
          mode: crypto$1.mode.CBC,
          padding: crypto$1.pad.Pkcs7
        });
        var res = decrypt.toString(crypto$1.enc.Utf8);
        return options !== null && options !== void 0 && options.parse ? JSON.parse(res) : res;
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

var pinia = (function (context) {
  console.log(context, '测试');
});

var pinia$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  'default': pinia
});

var index = /*#__PURE__*/Object.freeze({
  __proto__: null,
  pinia: pinia$1
});

export { crypto, index as plugins };
