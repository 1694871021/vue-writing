import { createVnode } from './createVnode.js';
export const h = (type, props, children) => {
  return createVnode(type, props, children);
}