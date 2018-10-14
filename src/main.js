import Vue from 'vue'
import App from './App.vue'

Vue.filter('moment', m => m ? m.format('ddd/DD-MMM') : '');

Vue.config.productionTip = false;


new Vue({
    render: h => h(App)
}).$mount('#app');

