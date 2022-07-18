
import { h } from './core/h.js';
import Children from './components/Children.js';
export default {
  name: 'App',
  setup(props) {
    
  },
  render() {
    return h("div", null , [h(Children)])
  }
}