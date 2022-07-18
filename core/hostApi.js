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
    case "style":
      el.setAttribute(key, nextValue);
      break;
      
    case 'onclick':
      if(!preValue) {
        el.addEventListener('click', nextValue);  
      }
      break;
  }
}

// 插入子节点方法
function hostInsert(child, parent, anchor = null) {
  if (parent) {
    // insertBefore() 定义一个父节点parent，将child节点插入到 anchor节点之前，
    // 如果anchor 为空 则将child最为最后一个子节点插入到parent
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
