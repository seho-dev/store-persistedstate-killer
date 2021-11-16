(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('crypto-js'), require('lscache')) :
  typeof define === 'function' && define.amd ? define(['exports', 'crypto-js', 'lscache'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.rem = {}, global.crypto$1, global.lscache));
})(this, (function (exports, crypto$1, lscache) { 'use strict';

  function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

  var crypto__default = /*#__PURE__*/_interopDefaultLegacy(crypto$1);
  var lscache__default = /*#__PURE__*/_interopDefaultLegacy(lscache);

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
      this.iv = crypto__default["default"].lib.WordArray.random(16);
      var title = ((_this$ctx = this.ctx) === null || _this$ctx === void 0 ? void 0 : _this$ctx.app.head.title) || '';
      var key = navigator.userAgent.toLowerCase() || '';
      var salt = title || '';
      this.key = crypto__default["default"].PBKDF2(key, salt, {
        keySize: 64,
        iterations: 64
      });
    }

    _createClass(Crypto, [{
      key: "setKey",
      value: function setKey(key, salt, keyMixTimes, keyLength) {
        this.key = crypto__default["default"].PBKDF2(key, salt, {
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
          var encrypted = crypto__default["default"].AES.encrypt(data, this.key, {
            iv: this.iv,
            mode: crypto__default["default"].mode.CBC,
            padding: crypto__default["default"].pad.Pkcs7
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
          var decrypt = crypto__default["default"].AES.decrypt(data, this.key, {
            iv: this.iv,
            mode: crypto__default["default"].mode.CBC,
            padding: crypto__default["default"].pad.Pkcs7
          });
          var res = decrypt.toString(crypto__default["default"].enc.Utf8);
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

  var isDev = process.env.NODE_ENV === 'development';
  var key = 'persistedstate-killer';
  var init = function init(context) {
    // 查看目前已有的存储
    var len = localStorage.length; // 获取之前被持久化的存储

    var storaged = []; // 获取缓存的name中的store名

    var flag = "".concat(key, "-").concat(context.store.$id, "-");

    for (var i = 0; i < len; i++) {
      var _localStorage$key;

      // 并且需要剔除不是此store的缓存
      var name = localStorage.key(i);

      if (name !== null && name !== void 0 && name.includes(flag) && (_localStorage$key = localStorage.key(i)) !== null && _localStorage$key !== void 0 && _localStorage$key.includes(key)) {
        var _localStorage$key2;

        storaged.push((_localStorage$key2 = localStorage.key(i)) === null || _localStorage$key2 === void 0 ? void 0 : _localStorage$key2.replace('lscache-', ''));
      }
    }

    var patchData = {};
    storaged.map(function (s) {
      patchData[s.split(flag)[1]] = lscache__default["default"].get(s);
    });
    context.store.$patch(patchData);
  };
  var use = function use(context) {
    isDev && console.log('🥷 store-persistedstate-killer running...'); // react to store changes

    context.store.$subscribe(function (e) {
      // 判断event是否是数组，如果是数组，说明是patch批量更新
      var isEventArray = Array.isArray(e.events); // 如果event是空数组，说明是无用的patch（patch的数据和旧数据一样）

      if (isEventArray && e.events.length === 0) return; // 更新 storage

      if (!isEventArray) {
        e.events = [e.events];
      }

      isDev && console.log('🥷 react to store changes:');

      if (isDev) {
        for (var i in e.events) {
          console.log("\uD83E\uDD77 ".concat(e.events[i].key, " (").concat(e.storeId, "): ").concat(e.events[i].oldValue, " -> ").concat(e.events[i].newValue));
        }
      }

      for (var _i in e.events) {
        lscache__default["default"].set("".concat(key, "-").concat(e.storeId, "-").concat(e.events[_i].key), e.events[_i].newValue);
      }
    });
  };

  var pinia = /*#__PURE__*/Object.freeze({
    __proto__: null,
    init: init,
    use: use
  });

  var index = /*#__PURE__*/Object.freeze({
    __proto__: null,
    pinia: pinia
  });

  exports.crypto = crypto;
  exports.plugins = index;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
