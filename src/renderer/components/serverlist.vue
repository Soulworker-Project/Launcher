<template>
    <div class="list_wrapper">
        <div class="list_title"> Serverlist </div>
        <v-btn class="list_add_custom" style="position: absolute" block color="primary" @click="create_open = true"> Add Server </v-btn>
        <div class="list_contain_wrapper">
            <div class="list_container" v-for="server, index in alllist" :key="index">
                <v-menu offset-y bottom>
                    <template v-slot:activator="{ on, attrs }">
                        <v-btn v-bind="attrs" v-on="on" block plain> {{server.name}} <v-icon v-if="server.favorited"> star </v-icon> </v-btn>
                    </template>
                    <v-list>
                        <v-list-item>
                            <v-list-item-title>
                                <div class="list_title"> Server Description </div>
                                {{server.description}}
                            </v-list-item-title>
                        </v-list-item>
                        <v-list-item>
                            <v-btn block color="primary" @click="$emit('server', server)"> Select Server </v-btn>
                        </v-list-item>
                        <v-list-item v-if="!server.id">
                            <v-btn block color="primary" @click="removeServer(server.index)"> Remove Server </v-btn>
                        </v-list-item>
                        <v-list-item v-if="server.id">
                            <v-btn block color="primary" @click="setFavorite(server.id, true)" v-if="!server.favorited"> Favorite Server </v-btn>
                            <v-btn block color="primary" @click="setFavorite(server.id, false)" v-if="server.favorited"> Remove Favorite </v-btn>
                        </v-list-item>
                    </v-list>
                </v-menu>
            </div>
        </div>
        <div class="create_wrapper" v-if="create_open">
            <div class="create_underlay" @click="create_open = false"> </div>
            <div class="create_container">
                <div class="create_title"> Add Server </div>
                <div class="create_submit"> 
                    <v-btn color="primary" block="" @click="addServer()"> Add Server </v-btn> 
                </div>
                <div class="create_inputs">
                    <v-text-field placeholder="Server Name" label="Server Name" v-model="add.name"/>
                    <v-text-field placeholder="Server Description" label="Server Description" v-model="add.description"/>
                    <v-text-field placeholder="Server IP" label="Server IP" v-model="add.ip"/>
                    <v-text-field placeholder="Server Port" label="Server Port" v-model="add.port"/>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
export default {
    data(){
        return {
            server_list: [],
            custom_server: [],
            favorite: [],
            create_open: false,
            add: {
                ip: '0.0.0.0',
                port: '10000',
                name: 'SoulWorker Private Server',
                description: 'This is a SoulWorker Private Server'
            }
        }
    },
    computed: {
        alllist(){
            var list = []
            this.favorite.forEach((fav) => {
                this.server_list.forEach((server, index) => {
                    if(server.id == fav.id) {
                        server['favorited'] = fav.favorited
                        if(fav.favorited) list.push(server)
                    }
                })
            })
            this.custom_server.forEach((server, index) => {if(!list.includes(server)) {server['index'] = index; list.push(server)}});
            this.server_list.forEach((server) => {if(!list.includes(server))list.push(server)});
            return list;
        },
    },
    methods: {
        addServer(){
            this.custom_server.push(this.add);
            this.add = {
                ip: '0.0.0.0',
                port: '10000',
                name: 'SoulWorker Private Server',
                description: 'This is a SoulWorker Private Server'
            }
            this.create_open = false;
            this.saveCustom();
        },
        removeServer(index) {
            this.custom_server.splice(index, 1)
            this.saveCustom();
        },
        saveCustom(){
            localStorage.setItem('custom', JSON.stringify(this.custom_server))
        },
        setFavorite(id, boo){
            this.favorite.forEach((server, index) => {
                if(server.id == id) this.favorite.splice(index, 1);
            })
            this.favorite.push({id: id, favorited: boo});
            localStorage.setItem('favorite', JSON.stringify(this.favorite))
        }
    },
    created(){
        if(localStorage.getItem('custom')) this.custom_server = JSON.parse(localStorage.getItem('custom'))
        if(localStorage.getItem('favorite')) this.favorite = JSON.parse(localStorage.getItem('favorite'))
        axios.get('/server')
        .catch((error) => {
        })
        .then((data) => {
            this.server_list = data.data
        })
    }
}
</script>

<style>
.list_wrapper{
    position: fixed;
    left: 3%;
    top: 3%;
    width: 30%;
    height: 85%;
    overflow: hidden;
    background-color: rgba(0, 0, 0, 0.7);
}
.list_contain_wrapper {
    overflow-y: auto;
    height: 87%;
}
.list_container {
    text-align: left;
    margin-top: 5px;
}
.list_title {
    text-align: center;
    font-size: 1.5rem;
    color: white;
    text-decoration-line: underline;
}
.list_add_custom {
    position: absolute;
    bottom: 0%;
    z-index: 2;
}
.create_underlay {
    z-index: 9;
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
}
.create_container {
    z-index: 10;
    background-color: #2C2F33;
    color: white;
    position: fixed;
    width: 30%;
    height: 70%;
    top: 15%;
    left: 35%;
    
    box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.9);
}

.create_inputs {
    width: 90%;
    margin-left: 3%;
    margin-top: 5%;
}

.create_submit {
    position: absolute;
    bottom: 0;
    width: 100%;
}
.create_title {
    text-align: center;
    font-size: 1.5rem;
    color: white;
    text-decoration-line: underline;
}
</style>