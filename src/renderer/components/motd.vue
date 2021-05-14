<template>
    <div class="motd_wrapper" v-if="id">
        <div class="motd_title"> Message of the Day </div>
        <div class="motd_message"> {{server.motd}} </div>
        <hr class="underline">
        <div class="motd_title"> Latest News </div>
        <div class="news_message" v-for="news, index in server.news" :key="index"> {{news.message}} </div> 
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

    },
    created(){
        axios.get(`http://46.228.199.84:3000/server/${this.id}`)
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
    font-size: 1.2rem;
    text-align: center;
    text-decoration-line: underline;
}
</style>