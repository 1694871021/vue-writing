import { render } from './renderer.js';
import { createVnode } from './createVnode.js';

export const createApp = (rootComponent) => {
  const app = {
    _component: rootComponent,
    _container: null,
    mount(rootContainer) {
      const vnode = createVnode(rootComponent);
      app._container = rootContainer;
      render(vnode, rootContainer);
    }
  }
  return app;
}