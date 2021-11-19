import crypto$2 from 'crypto-js';
import lscache from 'lscache';

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);

  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);

    if (enumerableOnly) {
      symbols = symbols.filter(function (sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      });
    }

    keys.push.apply(keys, symbols);
  }

  return keys;
}

function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};

    if (i % 2) {
      ownKeys(Object(source), true).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(Object(source)).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }

  return target;
}

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

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

var Crypto = /*#__PURE__*/function () {
  function Crypto(ctx) {
    var _this$ctx, _this$ctx2;

    _classCallCheck(this, Crypto);

    this.ctx = ctx || null;
    this.iv = crypto$2.enc.Utf8.parse(((_this$ctx = this.ctx) === null || _this$ctx === void 0 ? void 0 : _this$ctx.iv) || '');
    this.key = crypto$2.enc.Utf8.parse(((_this$ctx2 = this.ctx) === null || _this$ctx2 === void 0 ? void 0 : _this$ctx2.key) || navigator.userAgent.toLowerCase() || '');
  }

  _createClass(Crypto, [{
    key: "setKey",
    value: function setKey(key) {
      this.key = crypto$2.enc.Utf8.parse(key);
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
      try {
        var encJson = crypto$2.AES.encrypt(JSON.stringify(data), this.key, {
          iv: this.iv,
          mode: crypto$2.mode.CBC,
          padding: crypto$2.pad.Pkcs7
        }).toString();
        var encData = crypto$2.enc.Base64.stringify(crypto$2.enc.Utf8.parse(encJson));
        return encData;
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
        var decData = crypto$2.enc.Base64.parse(data).toString(crypto$2.enc.Utf8);
        var bytes = crypto$2.AES.decrypt(decData, this.key, {
          iv: this.iv,
          mode: crypto$2.mode.CBC,
          padding: crypto$2.pad.Pkcs7
        }).toString(crypto$2.enc.Utf8);
        return JSON.parse(bytes);
      } catch (error) {
        console.log(error);
        return null;
      }
    }
  }]);

  return Crypto;
}();

var crypto$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  Crypto: Crypto
});

// 配置对象, 这里配置一个默认的配置
var baseConfig = {
  include: undefined,
  exclude: undefined,
  storageKey: 'persistedstate-killer',
  title: '',
  isDev: process.env.NODE_ENV === 'development'
};
var configData = baseConfig;
var defineConfig = function defineConfig(config) {
  var reset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
  if (reset) configData = baseConfig; // 注册

  configData = _objectSpread2(_objectSpread2({}, configData), config);
};
var hitStore = function hitStore(storeName) {
  var _configData$exclude, _configData$include;

  // 如果exclude和include都没选择, 就是默认命中
  if (!configData.exclude && !configData.include) return true; // 根据config中的include，exclude条件

  var excludeResult = (_configData$exclude = configData.exclude) === null || _configData$exclude === void 0 ? void 0 : _configData$exclude.includes(storeName);
  var includeResult = (_configData$include = configData.include) === null || _configData$include === void 0 ? void 0 : _configData$include.includes(storeName);
  if (configData.include && includeResult) return true; // 如果include为空，但是excludeResult为false 则就命中

  if (!configData.include && !excludeResult) return true;
  return false;
};
var getStoreConfig = function getStoreConfig(storeName) {
  if (configData.store && configData.store[storeName]) {
    return configData.store[storeName];
  }

  return null;
};
var getStateConfig = function getStateConfig(storeName, stateName) {
  var storeConfig = getStoreConfig(storeName);

  if (storeConfig && storeConfig.state && storeConfig.state[stateName]) {
    return storeConfig.state[stateName];
  }

  return null;
};

var config = /*#__PURE__*/Object.freeze({
  __proto__: null,
  get configData () { return configData; },
  defineConfig: defineConfig,
  hitStore: hitStore,
  getStoreConfig: getStoreConfig,
  getStateConfig: getStateConfig
});

var init = function init(context) {
  // 查看当前store是否被命中，如果没有命中，则不执行init
  if (!hitStore(context.store.$id)) return;
  var storeConfig = getStoreConfig(context.store.$id); // 获取store的过期时间，默认为永久

  var expire = (storeConfig === null || storeConfig === void 0 ? void 0 : storeConfig.expire) || null; // 仓库名称，会优先取rename名称，如果没有指定rename则就是原名称

  var storeName = (storeConfig === null || storeConfig === void 0 ? void 0 : storeConfig.rename) || context.store.$id; // 查看目前已有的存储

  var len = localStorage.length; // 获取之前被持久化的存储

  var storaged = []; // 获取缓存的name中的store名

  var flag = "".concat(configData.storageKey, "-").concat(storeName, "-"); // 获取所有缓存

  for (var i = 0; i < len; i++) {
    // 获取存储的key值（lscache-**-**-**）
    var name = localStorage.key(i); // 判断存储的名称是否包含标识，如果包含说明是此store的存储

    if (name !== null && name !== void 0 && name.includes(flag)) {
      storaged.push(name === null || name === void 0 ? void 0 : name.replace('lscache-', ''));
    }
  }

  var patchData = {};
  storaged.map(function (s) {
    // 获取store下的state和state rename的引用
    var state = getRenameStateByStore(context.store.$id);
    var key = s.split(flag)[1]; // 查询key在引用中是否存在

    for (var _i in state) {
      if (state[_i] === key) {
        // 把原值返回给key
        key = _i;
      }
    }

    patchData[key] = getStorage(s);
  });
  context.store.$patch(patchData); // 将状态管理中的已知数据同步到local中

  var state = context.store.$state; // 查看state是否存在于local中，如果没有，则同步

  for (var _i2 in state) {
    var stateName = "".concat(flag).concat(_i2);
    var _expire = expire;

    if (lscache.get(stateName) === null) {
      var stateConfig = getStateConfig(context.store.$id, _i2);

      if (stateConfig) {
        var _stateConfig$noPersis = stateConfig.noPersisted,
            noPersisted = _stateConfig$noPersis === void 0 ? false : _stateConfig$noPersis,
            _stateConfig$rename = stateConfig.rename,
            rename = _stateConfig$rename === void 0 ? _i2 : _stateConfig$rename,
            _stateConfig$expire = stateConfig.expire,
            _expire2 = _stateConfig$expire === void 0 ? _expire : _stateConfig$expire;

        stateName = "".concat(flag).concat(rename);
        _expire = _expire2; // 判断此state是否需要序列化

        if (noPersisted) {
          // 不需要持久化
          continue;
        }
      }

      setStorage(stateName, state[_i2], _expire);
    }
  }
};
var use = function use(context) {
  if (!hitStore(context.store.$id)) return;
  var storeConfig = getStoreConfig(context.store.$id); // 获取store的过期时间，默认为永久

  (storeConfig === null || storeConfig === void 0 ? void 0 : storeConfig.expire) || null; // 仓库名称，会优先取rename名称，如果没有指定rename则就是原名称

  var storeName = (storeConfig === null || storeConfig === void 0 ? void 0 : storeConfig.rename) || context.store.$id;
  configData.isDev && console.log("\uD83E\uDD77 store-persistedstate-killer running..."); // react to store changes

  context.store.$subscribe(function (e) {
    // 判断event是否是数组，如果是数组，说明是patch批量更新
    var isEventArray = Array.isArray(e.events); // 如果event是空数组，说明是无用的patch（patch的数据和旧数据一样）

    if (isEventArray && e.events.length === 0) return; // 更新 storage

    if (!isEventArray) {
      e.events = [e.events];
    }

    configData.isDev && console.log('🥷 react to store changes:');

    if (configData.isDev) {
      for (var i in e.events) {
        console.log("\uD83E\uDD77 ".concat(e.events[i].key, " (").concat(e.storeId, "): ").concat(e.events[i].oldValue, " -> ").concat(e.events[i].newValue));
      }
    }

    for (var _i3 in e.events) {
      var stateName = e.events[_i3].key;
      var stateConfig = getStateConfig(context.store.$id, e.events[_i3].key);

      if (stateConfig) {
        var _stateConfig$noPersis2 = stateConfig.noPersisted,
            noPersisted = _stateConfig$noPersis2 === void 0 ? false : _stateConfig$noPersis2,
            _stateConfig$rename2 = stateConfig.rename,
            rename = _stateConfig$rename2 === void 0 ? stateName : _stateConfig$rename2;
            stateConfig.expire;
        stateName = rename;

        if (noPersisted) {
          continue;
        }
      }

      setStorage("".concat(configData.storageKey, "-").concat(storeName, "-").concat(stateName), e.events[_i3].newValue);
    }
  });
};

var pinia = /*#__PURE__*/Object.freeze({
  __proto__: null,
  init: init,
  use: use
});

var crypto = new Crypto({
  iv: configData.title
});
/**
 * @name 提供给插件设置storage的函数
 * @description 会根据当前的配置项来进行自动加密
 * @param {string} data
 */

var setStorage = function setStorage(key, data, expire) {
  var _data = data;

  if (!configData.isDev) {
    _data = crypto.encrypt(data) || data;
  }

  lscache.set(key, _data, typeof expire === 'number' ? expire : undefined);
};
/**
 * @name 提供给插件获取storage的函数
 * @param {string} key
 * @return {any}
 */

var getStorage = function getStorage(key) {
  var _data = lscache.get(key);

  if (!configData.isDev) {
    _data = crypto.decrypt(_data, {
      parse: true
    }) || null;
  }

  return _data;
};
/**
 * @name 获取state和renameState引用
 * @param {string} storeName
 */

var getRenameStateByStore = function getRenameStateByStore(storeName) {
  var storeConfig = getStoreConfig(storeName);
  var result = {};

  for (var key in storeConfig === null || storeConfig === void 0 ? void 0 : storeConfig.state) {
    if (storeConfig !== null && storeConfig !== void 0 && storeConfig.state[key].rename) {
      result[key] = storeConfig === null || storeConfig === void 0 ? void 0 : storeConfig.state[key].rename;
    }
  }

  return result;
};

var index = /*#__PURE__*/Object.freeze({
  __proto__: null,
  pinia: pinia,
  setStorage: setStorage,
  getStorage: getStorage,
  getRenameStateByStore: getRenameStateByStore
});

export { config, crypto$1 as crypto, index as plugins };
