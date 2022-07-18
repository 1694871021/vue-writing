import { ShapeFlags } from '../shapeFlags.js';
import {
  hostCreateElement,
  hostSetElementText,
  hostPatchProp,
  hostInsert,
  hostRemove,
} from "../hostApi.js";
import { effect } from "../../lib/mini-vue.esm.js";
export const render = (vnode, container) => {
  patch(null, vnode, container);
}
function patch(n1, n2, container) {
  // n1老节点，n2新节点
  // type为标签，shapeFlag类型怕判断标识
  const { type, shapeFlag } = n2;
  switch (type) {
    case 'text':
      break;
    default:
      if (shapeFlag & ShapeFlags.ELEMENT) {
        // 处理Element
        processElement(n1, n2, container);
      } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
        // 处理组件component
        processComponent(n1, n2, container);
      }
  }
}

// c处理类型为element部分-------------------
function processElement (n1, n2, container) {
  if(!n1) {
    // 初始化element
    mountElement(n2, container);
  } else {
    // 更新element
    updateElement(n1, n2, container);
  }
}

function mountElement (vnode, container) {
  const { shapeFlag, props } = vnode;
  // 1. 先创建 element
  // 基于可扩展的渲染 api
  console.log('初始化element, 调用hostCreateElement, 创造真实节点')
  const el = (vnode.el = hostCreateElement(vnode.type));
  // 2. 处理string类型和组件类型
  if(shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    // 举个栗子
    // render(){
    //     return h("div",{},"test")
    // }
    // 这里 children 就是 test ，只需要渲染一下就完事了
    hostSetElementText(el, vnode.children)
  } else if(shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    // 举个栗子
    // render(){
    // Hello 是个 component
    //     return h("div",{},[h("p"),h(Hello)])
    // }
    // 这里 children 就是个数组了，就需要依次调用 patch 递归来处理
    console.log('初始化为数组的子节点, 调用patch函数进行循环')
    mountChildren(vnode.children, el);
  }

  // 处理props属性值
  if(props) {
    for (const key in props) {
      const newVal = props[key];
      hostPatchProp(el, key, null, newVal);
    }
  }
  
  // todo
  // 触发 beforeMount() 钩子
  hostInsert(el, container);
  // todo
  // 触发 mounted() 钩子
}

//初始化子节点
function mountChildren (children, container) {
  children.forEach(child => {
    patch(null, child, container);
  });
}
// 更新element元素
function updateElement (n1, n2, container) {
  const oldProps = (n1 && n1.props) || {};
  const newProps = n2.props || {};
  
  // 将老节点的dom实例赋给新节点
  const el = (n2.el = n1.el);
  console.log('更新element', '旧节点', n1,  '新节点', n2)
  // 对比props
  patchProps(el, oldProps, newProps);

  // 对比children
  patchChildren(n1, n2, el);
}

function patchProps (el, oldProps, newProps) {
  // 1. oldProps和newProps都有对应的属性值
  for (const key in newProps) {
    const prevProps = oldProps[key];
    const nextProps = newProps[key];
    hostPatchProp(el, key, prevProps, nextProps);
  }
  // 2. oldProps有有对应的属性值，newProps没有
  for (const key in oldProps) {
    const prevProps = oldProps[key];
    const nextProps = null;
    if(!(key in newProps)) {
      hostPatchProp(el, key, prevProps, nextProps);
    }
  }
}

function patchChildren(n1, n2, container) {
  const { shapeFlag: prevShapeFlag, children: c1 } = n1;
  const { shapeFlag, children: c2 } = n2;

  // n2 的 children 是 text 类型的话
  if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    if (c2 !== c1) {
      hostSetElementText(container, c2);
    }
  } else {
    // 如果n1和n2都是数组，则要对两个数组进行比较，下面就是简单版的diff算法
    if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        patchKeyedChildren(c1, c2, container);
      }
    }
  }
}

// children为数组的对比
function patchKeyedChildren (c1, c2, container) {
  let i = 0;
  let e1 = c1.length - 1;
  let e2 = c2.length - 1;
  
  // 判断n1和n2的tag和传入的key值是否一致,来判断dom是否变更
  const isSameVNodeType = (n1, n2) => {
    return n1.type === n2.type && n1.key === n2.key; 
  }

  // 1.从左往右比对两个child的内容
  // [a1,b1,c1,d1]和[a2,b2,c2,d2]
  // a1 → a2, b1 → b2
  while(i <= e1 &&i <= e2) {
    const prevChild = c1[i];
    const nextChild = c2[i];
    if(!isSameVNodeType(prevChild, nextChild)) {
      break;
    }
    patch(prevChild, nextChild, container);
    i++;
  }
  
  // 2.从右向左对两个child
  // d1 → d2, c1 → c2
  while (i <= e1 && i <= e2) {
    const prevChild = c1[e1];
    const nextChild = c2[e2];
    if(!isSameVNodeType(prevChild, nextChild)) {
      break;
    }
    patch(prevChild, nextChild, container);
    e1--;
    e2--
  }

  // 3.新节点数量大于旧节点数量,需要新增节点
  if(i > e1 && i <= e2) {
    while(i <= e2) {
      patch(null, e2[i], container);
      i++;
    }
  } else if (i <= e1 && i > e2) {
    // 4.旧节点数量大于新节点数量，需要删除节点
    while (i <= e1) {
      hostRemove(c1[i].el);
      i++;
    }
  } else {
    // 5.左右两边都比对完了，然后剩下的就是中间部位顺序变动的
    let s1 = i;
    let s2 = i;

    const keyToNewIndexMap = new Map();
    // 先把 key 和 newIndex 绑定好，方便后续基于 key 找到 newIndex
    for (let i = 0; i <= e2; i++) {
      const nextChild = c2[i];
      keyToNewIndexMap.set(nextChild.key, i);
    }

    // 需要处理新节点的数量
    const toBePatched = e2 - s2 + 1;
    const newIndexToOldIndexMap = new Array(toBePatched);
    for (let g = 0; g < newIndexToOldIndexMap.length; g++) {
      // 源码里面是用 0 来初始化的
      // 但是有可能 0 是个正常值
      // 我这里先用 -1 来初始化
      newIndexToOldIndexMap[g] = -1;
    }
     // 遍历老节点
    // 1. 需要找出老节点有，而新节点没有的 -> 需要把这个节点删除掉
    // 2. 新老节点都有的，—> 需要 patch
    for (i = s1; i <= e1; i++) {
      const prevChild = c1[i];
      const newIndex = keyToNewIndexMap.get(prevChild.key);
      newIndexToOldIndexMap[newIndex] = i;

      // 因为有可能 nexIndex 的值为0（0也是正常值）
      // 所以需要通过值是不是 undefined 来判断
      // 不能直接 if(newIndex) 来判断
      if(newIndex === undefined) {
        // 当前节点的key 不存在于 newChildren 中，需要把当前节点给删除掉
        hostRemove(prevChild.el);
      } else {
        patch(prevChild, c2[newIndex], container);
      }
    }

    // 遍历新节点
    // 1. 需要找出老节点没有，而新节点有的 -> 需要把这个节点创建
    // 2. 最后需要移动一下位置，比如 [c,d,e] -> [e,c,d]
    for (i = e2; i >= s2; i--) {
      const nextChild = c2[i];
      if(newIndexToOldIndexMap[i] === -1) {
        // 说明是个新增的节点
        patch(null, c2[i], container);
      } else {
        // 有可能 i+1 没有元素 没有的话就直接设置为 null
        // 在 hostInsert 函数内如果发现是 null 的话，会直接添加到父级容器内
        const anchor = i + 1 > e2 + 1 ? null : c2[i + 1];
        hostInsert(nextChild.el, container, anchor && anchor.el);
      }
    }
  }
}

// 处理组件部分--------------
function processComponent (n1, n2, container) {
  if(!n1) {
    mountComponent(n2, container);
  } else {
    // updateComponent()
  }
}

function mountComponent (vnode, container) {
  // 1. 先创建一个 component instance
  console.log('创建组件的instance对象');
  const instance = (vnode.component = createComponentInstance(vnode));
  console.log('初始化props,setup,设置render函数');
  setupComponent(instance);
  console.log('setupRenderEffect中调用effect(), 进行依赖收集');
  setupRenderEffect(instance, container);
};

function createComponentInstance (vnode) {
  const instance = {
    type: vnode.type,
    vnode,
    props: {},
    proxy: null,
    isMounted: false
  }
  return instance;
}

function setupComponent (instance) {
  // 1. 处理 props
  // initProps();
  
  // 2. 处理 slots
  // initSlots();

  // 源码里面有两种类型的 component
  // 一种是基于 options 创建的
  // 还有一种是 function 的
  // 这里处理的是 options 创建的
  // 叫做 stateful 类型
  setupStatefulComponent(instance);
}

function setupStatefulComponent(instance) {
  // todo
  // 1. 先创建代理 proxy
  console.log("创建 proxy");
  // 2. 调用 setup
  // todo
  // 应该传入 props 和 setupContext
  const setupResult = instance.setup && instance.setup(instance.props);

  // 3. 处理 setupResult
  handleSetupResult(instance, setupResult);
}

function handleSetupResult(instance, setupResult) {
  // setup 返回值不一样的话，会有不同的处理
  // 1. 看看 setupResult 是个什么
  if (typeof setupResult === "function") {
    // 如果返回的是 function 的话，那么绑定到 render 上
    // 认为是 render 逻辑
    // setup(){ return ()=>(h("div")) }
    instance.render = setupResult;
  } else if (typeof setupResult === "object") {
    // 返回的是一个对象的话
    // 先存到 setupState 上
    instance.setupState = setupResult;
  }

  finishComponentSetup(instance);
}

function finishComponentSetup(instance) {
  // 给 instance 设置 render

  // 先取到用户设置的 component options
  const Component = instance.type;

  if (!instance.render) {
    // todo
    // 调用 compile 模块来编译 template
    // Component.render = compile(Component.template, {
    //     isCustomElement: instance.appContext.config.isCustomElement || NO
    //   })
  }

  instance.render = Component.render;
  // applyOptions()
}

function applyOptions() {
  // 兼容 vue2.x
  // todo
}

// 调用render函数
function setupRenderEffect (instance, container) {
  // 依赖收集   effect 函数
  // 触发依赖   update
  instance.update = effect(
    function componentEffect() {
      if(!instance.isMounted) {
        // 组件初始化调用
        // 这里的effect用于收集redner函数，在下一次数据变动的时候回执行该函数
        const subTree = (instance.subTree = instance.render(instance.proxy));
        console.log("调用 render,获取 subTree", subTree);
        // 这里基于 subTree 再次调用 patch
        patch(null, subTree, container);
        instance.isMounted = true;
      } else {
        // 数据变更后回执行这里
        // 生成新的vnode节点
        const nextTree = instance.render(instance.proxy);
        const prevTree = instance.subTree;

        // 用新节点替换老节点,使之成为下一次变更的老节点
        instance.subTree = nextTree;
        console.log("调用 render,获取 nextTree 更新节点", nextTree);
        // 触发 beforeUpdated hook

        patch(prevTree, nextTree, prevTree.el);
      }
    }
  )
   
}