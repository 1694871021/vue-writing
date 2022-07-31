// vue的patchFlags 静态标记
// vue在进行模板编译的时候会在节点中中添加数字来区分类型

export const PatchFlags = {
  TEXT: 1,// 1 动态的文本节点
  CLASS: 1 << 1,  // 2 动态的 class
  STYLE: 1 << 2,  // 4 动态的 style
  PROPS: 1 << 3,  // 8 动态属性，不包括类名和样式
  FULL_PROPS: 1 << 4,  // 16 动态 key，当 key 变化时需要完整的 diff 算法做比较
  HYDRATE_EVENTS: 1 << 5,  // 32 表示带有事件监听器的节点
  STABLE_FRAGMENT: 1 << 6,   // 64 一个不会改变子节点顺序的 Fragment
  KEYED_FRAGMENT: 1 << 7, // 128 带有 key 属性的 Fragment
  UNKEYED_FRAGMENT: 1 << 8, // 256 子节点没有 key 的 Fragment
  NEED_PATCH: 1 << 9,   // 512  表示只需要non-props修补的元素 (non-props不知道怎么翻才恰当~)
  DYNAMIC_SLOTS: 1 << 10,  // 1024 动态的solt
  DEV_ROOT_FRAGMENT: 1 << 11, //2048 表示仅因为用户在模板的根级别放置注释而创建的片段。 这是一个仅用于开发的标志，因为注释在生产中被剥离。

  //以下两个是特殊标记
  HOISTED: -1,  // 表示已提升的静态vnode,更新时调过整个子树
  BAIL: -2 // 指示差异算法应该退出优化模式
}
// 备注: 1<<n  表示十六进制中 1向左移n位, 如: 1<<3 ,则表示 0001 变成 0100 即:8