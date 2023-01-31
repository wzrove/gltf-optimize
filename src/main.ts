import { createApp } from 'vue';
import App from './App.vue';
import Message from 'vue-m-message';
import 'vue-m-message/dist/style.css';

import './index.css';

const app = createApp(App);
app.use(Message);

app.directive('disabled', (el: HTMLElement, binding) => {
  if (!binding.value) {
    el.classList.add('disabled');
    // el.addEventListener()
  } else {
    el.classList.remove('disabled');
  }
});
app.mount('#app');
