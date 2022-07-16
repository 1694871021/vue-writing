import { h } from '../core/h.js';
import { ref } from '../lib/mini-vue.esm.js';
const change = ref(false);

const prevChildren = [
  h("div", {key: "a", id: 'a'}, "a"),
  h("div", {key: "c", id: 'c'}, "c"),
  h("div", {key: "b", id: 'b'}, "b")
]

const nextChildren = [
  h("div", {key: "b", id: 'b'}, "b"),
  h("div", {key: "d", id: 'd'}, "d"),
]

export default {
  name: 'childern',
  setup(props) {
      
  },
  render() {
    return h("div", null, [
      h("button",
        {
          style: "color:red",
          onclick: ()=> {
            change.value = !change.value;
          }
        },
        "change事件------"
      ),
      h("div", null, change.value ? prevChildren: nextChildren)
    ])
  },
}