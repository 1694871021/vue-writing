// 生成dom节点方法
function hostCreateElement(type) {
  return document.createElement(type);
}

// 生成文本节点方法
function hostSetElementText(el, text) {
  el.innerText = text;
}

// 节点的属性值的处理
function hostPatchProp(el, key, preValue, nextValue) {
  // preValue 之前的值
  // nextValue 要更新的值
  switch (key) {
    case "id":
    case "tId":
      if (nextValue === null || nextValue === undefined) {
        el.removeAttribute(key);
      } else {
        el.setAttribute(key, nextValue);
      }
      break;
    case 'onclick':
      el.addEventListener('click', nextValue);  
  }
}

// 插入子节点方法
function hostInsert(child, parent, anchor = null) {
  if (parent) {
    parent.insertBefore(child, anchor);
  } else {
    parent.append(child);
  }
}

// 删除子节点方法
function hostRemove(child) {
  let parent = child.parentNode;
  if (parent) {
    parent.removeChild(child);
  }
}

export { hostCreateElement, hostSetElementText, hostPatchProp, hostInsert, hostRemove };
