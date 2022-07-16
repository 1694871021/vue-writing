// Object.defineProperties 实现响应式

// 重新定义数组原型
// const oldArray = Array.prototype;
// // 创建新对象，原型指向oldArray，但是不会改变原型
// const newArray = Object.create(oldArray);
// ['push','pop','shift','unshift','splice'].forEach((item) => {
//   newArray[item] = function () {
//     oldArray[item].call(this, ...arguments)
//   }
// })

// // 1.监听对象属性
// function observer(target) {
//   if (typeof target !== 'object' || target == null) return target;
//   // 拦截数据进行处理
//   if (Array.isArray(target)) {
//     Array._proto_ = newArray;
//   }
//   for (key in target) {
//     defineReactive(target, key, target[key])
//   }
// }

// // 2.设置读取对象属性
// function defineReactive(target, key, value) {
//   // 深度监听 
//   observer(value)
//   Object.defineProperty(target, key, {
//     // 获取属性值
//     get() {
//       return value
//     },
//     set(newVal) {
//       if (newVal !== value) {
//         value = newVal;
//         // 深度监听
//         observer(newVal);
//       }
//     }
//   })
// }

// new Proxy 实现响应式

// function reactive(target = {}) {
//   if(typeof target !== 'object' || target == null ) return target;
//   const obverse = new Proxy(target, {
//     get(target, key, receiver) {
//       // 只处理本身的属性
//       const keySelf = Reflect.ownKeys(target);
//       if(keySelf.includes(key)) {
//       }
//       const flag = Reflect.get(target, key, receiver);
//       // 深度监听 如果flag返回的时对象那么继续递归，获取到哪一层 哪一层才会触发响应式
//       return reactive(flag)
//     },
//     set(target, key, value, receiver) {
//       // 重复数据不处理
//       if(value == target[key]) return true;
//       const flag = Reflect.set(target, key, value, receiver);
//       return flag;
//     },
//     deleteProperty(target, key, value, receiver) {
//       // 删除处理
//       const flag = Reflect.deleteProperty(target, key);
//       return flag;
//     }
//   })
//   return obverse
// }

// class Dep 单值实现响应式

let currentEffect;
class Dep {
  constructor(val) {
    this.effects = new Set();
    this._val = val;
  }
  get value() {
    this.depend();
    return this._val;
  }
  set value(newVal) {
    this._val = newVal;
    this.notice();
  }
  // 收集依赖
  depend () {
    if(currentEffect) {
      this.effects.add(currentEffect);
    }
  }
  // 触发依赖
  notice() {
    this.effects.forEach(effect => {
      effect();
    });
  }
}
function effectWatch (effect) {
  currentEffect = effect;
  effect();
  currentEffect = null;
}

// 对象 响应式
const targetMap = new Map();

function getDep (target, key) {
  let depMap = targetMap.get(target);
  if(!depMap) {
    depMap = new Map();
    targetMap.set(target, depMap);
  }
  let dep = depMap.get(key);
  if(!dep) {
    dep = new Dep();
    depMap.set(key, dep);
  }
  return dep;
}

function reactive (raw) {
  return new Proxy(raw, {
    get(target, key) {
      let dep = getDep(target, key);
      // 依赖收集
      dep.depend();
      return Reflect.get(target, key);
    },
    set(target, key, value) {
      let dep = getDep(target, key);
      let result = Reflect.set(target, key, value);
      dep.notice();
      return result;
    }
  })
}

export { reactive, effectWatch }
