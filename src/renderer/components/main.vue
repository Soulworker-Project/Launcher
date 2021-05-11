<template>
  <div class="wrapper" id="wrapper">
      {{ error.message }}
      <div class="progress"> <v-progress-linear value="100" height="20" color="green" > Everything ready! </v-progress-linear> </div>
      <div v-if="newestVersion == currentVersion">
        <div class="controls">
          <v-btn class="launch" @click="launchGame()" color="primary" :disabled="game.running" title="Launch Game">Launch Game</v-btn>
          <v-btn class="settings" color="primary" v-if="!game.emitter" title="Settings"> <v-icon> settings </v-icon> </v-btn>
          <v-btn class="kill" @click="killGame()" v-if="game.emitter" color="red" title="Terminate Game"> <v-icon> close </v-icon> </v-btn>
        </div>
      </div>
      <div class="install" v-if="false">
        <div class="controls">
          <v-btn class="install" color="primary"> Install Game </v-btn>
          <v-btn @click="input()" color="primary"> Already Installed? </v-btn>
        </div>
      </div>
      <div class="installer" v-if="false">
        <Installer/>
      </div>
  </div>
</template>

<script>

import { startGame } from "../../main/plugins/gamehelper.js";
import Installer from './installer';

export default {
  name: "Main",
  components: {
    Installer
  },
  data() {
    return {
      serverList: [],
      progress: {
        message: "Everything ready!",
        current: 0,
        max: 0
      },
      selectedServer: {
        ip: "",
        port: ""
      },
      error: {
        message: null
      },
      game: {
        emitter: undefined,
        running: false
      }
    }
  },
  computed: {
    newestVersion() {

    },
    currentVersion() {

    },
    gamepath(){
      return localStorage.getItem('game_path')
    }
  },
  methods: {
    launchGame() {
      this.game.emitter = startGame(this.gamepath, "87.237.52.46", "10000");
      this.game.running = true;
      this.game.emitter.once('stop', () => {
        this.game.running = false;
        this.game.emitter = undefined;
      })
    },
    killGame(){
      if(this.game.emitter) {
        this.game.emitter.emit('kill', true)
        this.game.emitter = undefined;
      }
    },
    input(){
      const input = document.createElement('input');
      input.setAttribute('webkitdirectory', true)
      input.setAttribute('type', 'file')
      input.setAttribute('directory', true)
      input.addEventListener('change', this.setFolder);

      document.body.appendChild(input)
      input.click()
      document.body.removeChild(input)
    },
    setFolder(event) {
      localStorage.setItem('game_path', event.target.files[0].path)
    }
  },
  created() {
  }
};
</script>

<style>
.wrapper {
  position: absolute;
  width: 100%;
  height: 100%;
  background-image: url("https://images.mein-mmo.de/medien/2017/08/SoulWorker-Title-Original.jpg");
  background-repeat: no-repeat;
  background-size: 110%;
}

.controls {
  position: fixed;
  right: 1%;
  bottom: 5px;
} 

.progress {
  position: fixed;
  left: 1%;
  bottom: 8px;
  width: 75%;
}

.installer {
  z-index: 100;
  position: fixed;

  width: 100%;
  height: 100%;

  left: 0%;
  top: 0%;
}

</style>
