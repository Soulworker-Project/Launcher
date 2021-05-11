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
export default {
  name: "soulworker-launcher",
};
</script>

<style>
/* CSS */

::-webkit-scrollbar {
  display: none;
}
</style>
