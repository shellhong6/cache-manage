const STORAGE_PREFIX_KEY = 'common_package_cache_manage_'

export default class BaseManage {
  constructor ({
    mainKey = location.href.substr(0, 100),
    maxAge = 9e5, // 有效缓存时长，默认15分钟
  }) {
    this.mainKey = `${STORAGE_PREFIX_KEY}${mainKey}`
    this.maxAge = maxAge
    this.map = {}
    var temp = localStorage.getItem(this.mainKey)
    if (temp) {
      try {
        this.map = JSON.parse(temp)
      } catch (e) {
        console.warn(e)
      }
    }
  }

  set (key, data) {
    this.map[key] = {
      data,
      lastModify: Date.now()
    }
    this.save()
  }

  get (key) {
    var result = this.map[key]
    if (result) {
      if (Date.now() - result.lastModify < this.maxAge) { // 有效期内
        result = result.data
      } else {
        result = null
        delete this.map[key]
        this.save()
      }
      return result
    } else {
      result = null
    }
    return result
  }

  save () {
    if (this.maxAge <= 0) {
      return
    }
    try {
      localStorage.setItem(this.mainKey, JSON.stringify(this.map))
    } catch (e) {
      console.warn(e)
    }
  }
}
