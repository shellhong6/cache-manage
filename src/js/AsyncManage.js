/**
 * 该模块不太适用于set和其对应的get距离时间很长的操作
 * 该模块的maxAge配置项，针对的是set（因为如果针对get的话，有可能出现set请求一次后，到了get的时候，又失效了，又得重新获取）
 * 同样的key情况下，set和get是一对多的关系
 */
import BaseManage from './BaseManage.js'

export default class AsyncManage {
  constructor (opt) {
    this.baseManage = new BaseManage(opt)
    this.callbackListMap = {}
    this.dataMap = {}
  }

  async set (key, asyncFn) {
    this.reset(key)

    var data = this.baseManage.get(key)
    if (data) { // 缓存数据尚未失效，存储起来，用于下一次get；因为是异步的，无法知道下一次get是什么时候，即下一次this.baseManage.get(key)的时候，数据有可能已失效，所以需要存起来
      this.dataMap[key] = data
      return
    }

    data = await asyncFn() // 缓存数据已失效，发起请求
    this.baseManage.set(key, data)
    this.dataMap[key] = data // 如果下次get距离此次请求超过缓存最长有效时间，那么this.baseManage.get(key)会获取不到数据，这种情况下，只能通过dataMap来获取了

    var callbackList = this.callbackListMap[key] // get的时候，请求尚未完成
    if (callbackList && callbackList.length) {
      callbackList.forEach((callback) => {
        callback(data)
      })
    }
  }

  get (key) {
    return new Promise((resolve) => {
      var data = this.dataMap[key] // 用上一次set存储下来的数据；因为无法保证get距离对应的set的时长，所以不使用this.baseManage.get(key)

      if (data) {
        resolve(data)
      } else {
        if (!this.callbackListMap[key]) {
          this.callbackListMap[key] = []
        }
        this.callbackListMap[key].push(resolve)
      }
    })
  }

  reset (key) {
    delete this.dataMap[key]
    delete this.callbackListMap[key]
  }
}
