<template>
    <div class="motd_wrapper" v-if="id">
        <div class="motd_title"> Message of the Day </div>
        <div class="motd_message"> {{server.motd}} </div>
        <hr class="underline">
        <div class="motd_title"> Latest News </div>
        <div class="news_container" v-for="news, index in server.news" :key="index"> 
            <v-menu>
                <template v-slot:activator="{ on, attrs }">
                    <v-btn v-bind="attrs" v-on="on" block plain> {{formatTime(news.date)}} </v-btn>
                </template>
                <v-list>
                    <v-list-item>
                        <v-list-item-title> <div class="motd_title"> {{formatTime(news.date)}} </div> </v-list-item-title>
                    </v-list-item>
                    <v-list-item>
                        <div class="news_message"> {{news.message}} </div>
                    </v-list-item>
                </v-list>
            </v-menu>
        </div> 
    </div>
</template>

<script>
import axios from 'axios';
export default {
    props: [
        'id'
    ],
    data(){
        return {
            server: {}
        }
    },
    computed: {

    },
    methods: {
        formatTime(data) {
            data = parseInt(data)
            var d = new Date(data)
            var date = d.getDate()
            if(date < 10) date = '0' + date;
            var month = d.getMonth()+1;
            if(month < 10) month = '0' + month
            var year = d.getFullYear();
            var hour = d.getHours();
            if(hour < 10) hour = '0' + hour;
            var minute = d.getMinutes();
            if(minute < 10) minute =  '0' + minute
            return `${date}.${month}.${year} ${hour}:${minute}`
        }
    },
    created(){
        axios.get(`/server/${this.id}`)
        .catch((error) => {
        })
        .then((data) => {
            this.server = data.data
        })
    }
}
</script>

<style>
.motd_wrapper {
    position: fixed;
    right: 2%;
    top: 12%;
    height: 80%;
    width: 30%;

    background-color: rgba(0, 0, 0, 0.7);
}
.motd_title {
    font-size: 1.6rem;
    text-decoration-line: underline;
    text-align: center;
}
.motd_message{
    text-align: center;
    font-size: 1.1rem;
}
.underline {
  border-bottom-style: solid;
}
.news_message {
    font-size: 1.1rem;
    text-align: center;
}
</style>