<template>
  <div class="wrapper" id="wrapper" v-if="refresh">
      <div class="notifications" v-for="notification, index in notifications" :key="index" :style="`right: ${notification.position}%;`">
         <v-alert class="notification" v-if="notification.visible" :dismissible="notification.dismiss" :type="notification.type"> {{notification.text}} </v-alert>
      </div>
      <div class="progress">
        <div class="c" v-if="progress.downloading"> {{progress.downloading}} </div>
        <v-progress-linear :value="percent" height="20" color="green" >  {{message}} </v-progress-linear> 
      </div>
      <div v-if="gamepath">
        <div class="controls">
          <v-btn class="launch" @click="launchGame()" color="primary" :disabled="game.running || install.installing || !selectedServer" title="Launch Game">Launch Game</v-btn>
          <v-btn class="settings" color="primary" v-if="!game.emitter" title="Settings" @click="open_settings = true"> <v-icon> settings </v-icon> </v-btn>
          <v-btn class="kill" @click="killGame()" v-if="game.emitter" color="red" title="Terminate Game"> <v-icon> close </v-icon> </v-btn>
        </div>
      </div>
      <div class="install" v-if="!gamepath">
        <div class="controls">
          <v-btn class="install" color="primary" @click="install.open = true"> Install Game </v-btn>
          <v-btn @click="input()" color="primary" title="Already Installed?"> <v-icon> folder_open </v-icon> </v-btn>
        </div>
      </div>
      <div class="installer" v-if="install.open">
        <div class="installer_underlay" @click="install.open = false"> </div>
        <Installer @path="startInstall($event)"/>
      </div>
      <div class="version">
          <div class="client_version"> Client Version: {{currentVersion}} |</div>
          <div class="server_version"> Server Version: {{newestVersion}} |</div>
          <div class="launcher_version"> Launcher Version: {{ClientVersion}} </div>
      </div>
      <ServerList @server="selectServer($event);"/>
      <Settings v-if="open_settings" @close="open_settings = false" @check="checkgame()" @folder="input()" @filechecks="file_checks($event)" :check="install.installing" :file_checking="filechecks"/>
      <MOTD v-if="selectedServer && selectedServer.id" :id="selectedServer.id"/>
  </div>
</template>

<script>
import { startGame, getVersion } from "../../main/plugins/gamehelper.js";
import { checkGame, downloadGame } from "../../main/plugins/downloadhelper";
import { version } from '../../../package.json';
import Installer from './installer';
import ServerList from './serverlist'
import Settings from './settings'
import MOTD from './motd';
import axios from 'axios'

export default {
  name: "Main",
  components: {
    Installer,
    ServerList,
    Settings,
    MOTD
  },
  data() {
    return {
     open_settings: false,
      manifest: undefined,
      refresh: true,
      install: {
        open: false,
        installing: false,
      },
      serverList: [],
      progress: {
        current: 0,
        max: 0,
        downloading: undefined,
        total: 0,
        done: 0
      },
      selectedServer: undefined,
      error: {
        message: null
      },
      game: {
        emitter: undefined,
        running: false,
        gamepath: undefined
      },
      notifications: [],
      newestVersion: 'Unkown'
    }
  },
  computed: {
    filechecks(){
      return localStorage.getItem('checking') == 'true'
    },
    currentVersion() {
      return getVersion(this.gamepath)
    },
    ClientVersion() {
      return version;
    },
    gamepath(){
      return localStorage.getItem('game_path') || this.game.gamepath
    },
    percent(){
      if(this.progress.current == 0 && this.progress.max == 0) return 100;
      var p = Math.round(((this.progress.current / this.progress.max) * 100) * 10) / 10
      if(p > 100) p = 100;
      if(p !== 0) return p;
      return undefined
    },
    message(){
      if(this.install.installing) return `${this.formatBytes(this.progress.done, 2)} / ${this.formatBytes(this.progress.total, 2)}`
      if(this.percent && this.percent !== 100) return `${this.percent}%`;
      if(!this.gamepath) return "No Gameclient found"
      if(!this.selectedServer) return "Please Select a Server";
      return "Everything done!"
    }
  },
  methods: {
    file_checks(event) {
      alert("Currently not Working!")
      this.open_settings = false;
      localStorage.setItem('checking', event)
      this.$nextTick(() => {
        this.open_settings = true;
      })
    },
    refreshdata(){
      this.refresh = false;
      this.$nextTick(() => {
        this.refresh = true;
      })
    },
    launchGame() {
      this.game.emitter = startGame(this.gamepath, this.selectedServer.ip, this.selectedServer.port);
      this.game.running = true;
      this.game.emitter.once('stop', () => {
        this.game.running = false;
        this.game.emitter = undefined;
      })
    },
    selectServer(server){
      this.selectedServer = server;
      localStorage.setItem('selected', JSON.stringify(server))
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
      this.game.gamepath = event.target.files[0].path
      localStorage.setItem('game_path', event.target.files[0].path)
      this.refreshdata();
      this.checkgame();
    },
    checkgame(){
        if(this.gamepath) checkGame(this.gamepath, this.manifest).then((game) => {
          this.install.installing = true;
          game.emit("start", true);
          game.on('sum', (data) => {
            this.progress.max = data;
          })
          game.on('current', (data) => {
            this.progress.current = data;
          })
          game.on('check', (data) => {
            this.progress.downloading = `Currently Checking: ${data}`
          })
          game.on('download', (data) => {
            this.progress.downloading = `Currently Repairing: ${data}`
          })
          game.on('progress', (data) => {
            this.progress.total = data.total;
            this.progress.done = data.done
          })
          game.on('done', (data) => {
            this.progress.downloading = undefined;
            this.progress.current = this.progress.max;
            this.install.installing = false;
            this.createNotification(false, 50, 10000, 'success', 'Game is ready to play!');
          })
          game.on('err', (data) => {
            this.createNotification(false, 50, 10000, 'error', data);
          })
      });
    },
    startInstall(path) {
      this.game.gamepath = path
      localStorage.setItem('game_path', path)
      this.install.open = false;
      this.install.installing = true;

      downloadGame(path, this.manifest).then((game) => {
          game.emit("start", true);
          game.on('sum', (data) => {
            this.progress.max = data;
          })
          game.on('current', (data) => {
            this.progress.current = data;
          })
          game.on('download', (data) => {
            this.progress.downloading = `Currently Downloading: ${data}`
          })
          game.on('done', (data) => {
            this.progress.downloading = undefined;
            this.progress.current = this.progress.max;
            this.install.installing = false;
            this.createNotification(false, 50, 10000, 'success', 'Installed Game successfully!');
          })
          game.on('progress', (data) => {
            this.progress.total = data.total;
            this.progress.done = data.done
          })
          game.on('err', (data) => {
            this.createNotification(false, 50, 10000, 'error', data);
          })
      })
    },
    createNotification(dismissable, slideDuration, duration, type, message){
    var pos = -10;
    this.notifications.push({
      dismiss: dismissable,
      position: pos,
      type: type,
      text: message,
      visible: true
    })
    var i = setInterval(() => {
      var move = 2/slideDuration;
      this.notifications.forEach((notification) => {
        if (notification.text == message && notification.dismiss == dismissable 
            && notification.type == type && notification.position == pos) {
            pos = pos + move;
            notification.position = pos;
            if(pos >= 2){
              clearInterval(i);
            }
        }
      })
    }, 1);
    var t = setTimeout(() => {
      var j = setInterval(() => {
      var move = 5/slideDuration;
      this.notifications.forEach((notification) => {
        if (notification.text == message && notification.dismiss == dismissable 
            && notification.type == type && notification.position == pos) {
            pos -= move;
            notification.position = pos;
            if(pos <= -10){
              clearInterval(j);
              notification.visible = false;
            }
        }
      })
    }, 1);
    }, slideDuration + duration);
  },
  formatBytes(a,b=2){if(0===a)return"0 Bytes";const c=0>b?0:b,d=Math.floor(Math.log(a)/Math.log(1024));return parseFloat((a/Math.pow(1024,d)).toFixed(c))+" "+["Bytes","KB","MB","GB","TB","PB","EB","ZB","YB"][d]},

  },
  created() {
    this.$vuetify.theme.dark = true;
    if(localStorage.getItem('selected')) this.selectedServer = JSON.parse(localStorage.getItem('selected'))
    axios.get(`/manifest`)
    .catch((error) => {
      this.createNotification(false, 50, 10000, 'error', error);
    })
    .then((res) => {
      this.manifest = res.data;
      this.checkgame();
    })
    axios.get('/version')
    .catch((error) => {
    })
    .then((data) => {
      this.newestVersion = data.data.ver
    })
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
  position: fixed;
  width: 100%;
  height: 100%;

  left: 0%;
  top: 0%;
}
.installer_underlay {
  z-index: 9;
  position: fixed;
  width: 100%;
  height: 100%;
  left: 0%;
  top: 0%;
}

.current {
  color: white;
  background-color: rgba(0, 0, 0, 0.8);
  width: auto;
}
.notifications {
  position: fixed;
  margin-top: 1%;
  z-index: 110;
  width: auto;
  height: 10%;
}
.version {
  position: fixed;
  top: 0%;
  left: 5px;
  font-size: 0.7rem;
}
.client_version, .server_version, .launcher_version {
  display: inline-block;
}
</style>
