# 异步缓存方案

该库用于解决数据的存储问题，可设置存储有效时长。目前包括了两个类

* BaseManage：基础缓存类
* AsyncManage：基于基础缓存类拓展出来的异步请求缓存类

## BaseManage

>超时时间对get方法生效（即调用get的时候，进行超时判断）

```
import BaseManage from '@ebook/cache-manage/src/js/BaseManage.js'

var cacheObj = new BaseManage({
  mainKey: 'activity-xxxxxx', // 存储主健
  maxAge: 9e5 // 有效缓存时长，默认15分钟
});

cacheObj.set('clickQrequency', 3); // 存储
console.log(cacheObj.get('clickQrequency')); // 打印3，get可以多次调用，不用怕影响性能

setTimeout(function(){
  console.log(cacheObj.get('clickQrequency')); // 打印null，存储超时
}, 9e5 + 1000)
```

存储数据结构如下：

```
activity-xxxxxx:{"clickQrequency":{"data":3,"lastModify":1544755560733}}
```

## AsyncManage

>超时时间对set方法生效（即调用set的时候，进行超时判断）

```
import CacheManage from '@ebook/cache-manage';

var cacheObj = new CacheManage({
  mainKey: 'activity-xxxxxx', // 存储主健
  maxAge: 9e5 // 有效缓存时长，默认15分钟
});

cacheObj.set('clickQrequency', function(){ // 和BaseManage的set不一样，这里需要一个提供一个异步方法
  return new Promise(function (resolve) {
    setTimeout(function () {
      resolve(3)
    }, 3000)
  })
});

var clickQrequency = await cacheObj.get('clickQrequency');
console.log(clickQrequency); // 打印3，get可以多次调用，不用怕影响性能


setTimeout(function(){
  clickQrequency = await cacheObj.get('clickQrequency');
  console.log(clickQrequency); // 打印3，存储超时以set为准，所以此处不会超时
}, 9e5 + 1000)

```

存储数据结构如下：

```
activity-xxxxxx:{"clickQrequency":{"data":3,"lastModify":1544755560733}}
```

### AsyncManage应用场景

很多时候，页面的展示，需要请求完接口后，才能请求回来的数据，进行逻辑处理和页面渲染。
针对这种情况，我们往往会在`html`头部先发起请求，然后加载完逻辑`js`后，直接使用刚刚在头部已经请求回来的数据，这样的话就实现了并行，提高了页面访问效率。但是要实现这个逻辑，你会遇到以下问题：

* 怎么在使用数据的时候，保证数据已经请求回来了
* 在上一问题基础上，加上缓存和超时概念，那么问题就更复杂了

有了AsyncManage，遇到上面那种应用场景，你可以在`html`头部调用其`set`发起异步请求，然后在任何你喜欢的地方，调用`get`获取数据。
并且支持多次`get`，也支持存储和超时判断功能。
