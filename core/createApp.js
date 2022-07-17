import { render } from './renderer/renderer.js';
import { createVnode } from './createVnode.js';

export const createApp = (rootComponent) => {
  console.log("创建app 进行初始化",);
  const app = {
    _component: rootComponent,
    _container: null,
    mount(rootContainer) {
      const vnode = createVnode(rootComponent);
      console.log("基于根组件rootComponent创建 vnode", vnode);
      app._container = rootContainer;
      console.log("调用 render函数 再调用patch函数");
      render(vnode, rootContainer);
    }
  }
  return app;
}