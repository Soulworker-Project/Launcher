<template>
  <v-app>
    <v-content>
      <div id="app">
        <router-view></router-view>
      </div>
    </v-content>
  </v-app>
</template>

<script>
import Axios from 'axios';
export default {
  name: "soulworker-launcher",
  created(){
    Axios.defaults.baseURL = "http://46.228.199.84:3000"
  }
};
</script>

<style>
/* CSS */

::-webkit-scrollbar {
  display: none;
}
</style>
