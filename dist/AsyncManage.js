(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.AsyncManage = factory());
}(this, (function () { 'use strict';

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

var STORAGE_PREFIX_KEY = 'common_package_cache_manage_';

var BaseManage = function () {
  function BaseManage(_ref) {
    var _ref$mainKey = _ref.mainKey,
        mainKey = _ref$mainKey === undefined ? location.href.substr(0, 100) : _ref$mainKey,
        _ref$maxAge = _ref.maxAge,
        maxAge = _ref$maxAge === undefined ? 9e5 : _ref$maxAge;
    classCallCheck(this, BaseManage);

    this.mainKey = '' + STORAGE_PREFIX_KEY + mainKey;
    this.maxAge = maxAge;
    this.map = {};
    var temp = localStorage.getItem(this.mainKey);
    if (temp) {
      try {
        this.map = JSON.parse(temp);
      } catch (e) {
        console.warn(e);
      }
    }
  }

  createClass(BaseManage, [{
    key: 'set',
    value: function set$$1(key, data) {
      this.map[key] = {
        data: data,
        lastModify: Date.now()
      };
      this.save();
    }
  }, {
    key: 'get',
    value: function get$$1(key) {
      var result = this.map[key];
      if (result) {
        if (Date.now() - result.lastModify < this.maxAge) {
          // 有效期内
          result = result.data;
        } else {
          result = null;
          delete this.map[key];
          this.save();
        }
        return result;
      } else {
        result = null;
      }
      return result;
    }
  }, {
    key: 'save',
    value: function save() {
      if (this.maxAge <= 0) {
        return;
      }
      try {
        localStorage.setItem(this.mainKey, JSON.stringify(this.map));
      } catch (e) {
        console.warn(e);
      }
    }
  }]);
  return BaseManage;
}();

/**
 * 该模块不太适用于set和其对应的get距离时间很长的操作
 * 该模块的maxAge配置项，针对的是set（因为如果针对get的话，有可能出现set请求一次后，到了get的时候，又失效了，又得重新获取）
 * 同样的key情况下，set和get是一对多的关系
 */
var AsyncManage = function () {
  function AsyncManage(opt) {
    classCallCheck(this, AsyncManage);

    this.baseManage = new BaseManage(opt);
    this.callbackListMap = {};
    this.dataMap = {};
  }

  createClass(AsyncManage, [{
    key: 'set',
    value: async function set$$1(key, asyncFn) {
      this.reset(key);

      var data = this.baseManage.get(key);
      if (data) {
        // 缓存数据尚未失效，存储起来，用于下一次get；因为是异步的，无法知道下一次get是什么时候，即下一次this.baseManage.get(key)的时候，数据有可能已失效，所以需要存起来
        this.dataMap[key] = data;
        return;
      }

      data = await asyncFn(); // 缓存数据已失效，发起请求
      this.baseManage.set(key, data);
      this.dataMap[key] = data; // 如果下次get距离此次请求超过缓存最长有效时间，那么this.baseManage.get(key)会获取不到数据，这种情况下，只能通过dataMap来获取了

      var callbackList = this.callbackListMap[key]; // get的时候，请求尚未完成
      if (callbackList && callbackList.length) {
        callbackList.forEach(function (callback) {
          callback(data);
        });
      }
    }
  }, {
    key: 'get',
    value: function get$$1(key) {
      var _this = this;

      return new Promise(function (resolve) {
        var data = _this.dataMap[key]; // 用上一次set存储下来的数据；因为无法保证get距离对应的set的时长，所以不使用this.baseManage.get(key)

        if (data) {
          resolve(data);
        } else {
          if (!_this.callbackListMap[key]) {
            _this.callbackListMap[key] = [];
          }
          _this.callbackListMap[key].push(resolve);
        }
      });
    }
  }, {
    key: 'reset',
    value: function reset(key) {
      delete this.dataMap[key];
      delete this.callbackListMap[key];
    }
  }]);
  return AsyncManage;
}();

return AsyncManage;

})));
