<template>
    <div class="install_wrapper" v-if="refresh">
        <div class="install_title"> Install SoulWorker </div>
        <div class="install_folder">
            <div class="install_buttons"> 
                <div class="install_to"> Gamepath: <div class="install_path"> {{selected || message}} </div> </div>
                <v-btn color="primary" class="install_button" @click="input()" block> Select Folder </v-btn>
                <v-btn color="primary" class="install_button" block :disabled="selected == undefined" @click="$emit('path', selected)"> Install </v-btn>
            </div>
            <div class="install_text">
                <div class="install_needed"> Space needed: {{formatBytes(disk.needed, 2)}} </div>
                <div class="install_free"> Free Space: {{formatBytes(disk.free, 2)}} </div>
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios'
import { getSpace } from '../../main/plugins/installhelper'
export default {
    data(){
        return {
            refresh: true,
            message: 'Please select a Installation Folder',
            selected: undefined,
            disk: {
                free: 0,
                total: 0,
                needed: 0
            }
        }
    },
    methods: {
        refreshdata(){
          this.refresh = false;
          this.$nextTick(() => {
            this.refresh = true;
          })
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
          this.selected = event.target.files[0].path
          this.getSpace()
        },
        formatBytes(a,b=2){if(0===a)return"0 Bytes";const c=0>b?0:b,d=Math.floor(Math.log(a)/Math.log(1024));return parseFloat((a/Math.pow(1024,d)).toFixed(c))+" "+["Bytes","KB","MB","GB","TB","PB","EB","ZB","YB"][d]},
        async getSpace() {
            if(this.selected){
                var g = await getSpace(this.selected)
                this.disk.free = g.free;
            }
        }
    },
    created(){
        axios.get('/size')
        .catch((error) => {
        })
        .then((data) => {
            this.disk.needed = data.data.total_size;
        })
    }
}
</script>

<style>
.install_wrapper {
    z-index: 10;
    background-color: #2C2F33;
    color: white;
    position: absolute;
    width: 30%;
    height: 35%;
    top: 40%;
    left: 35%;
    
    box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.9);
}
.install_title {
    text-align: center;
    font-size: 1.5rem;
    text-decoration-line: underline;
}
.install_buttons {
    position: absolute;
    width: 100%;
    bottom: 0;
}
.install_button {
    margin-bottom: 5px;
}
.install_text {
    text-align: center;
}
.install_to {
    display: inline-block;
    font-size: 0.8rem;
    text-align: center;
}
.install_path {
    text-align: center;
    display: inline-block;
}
</style>