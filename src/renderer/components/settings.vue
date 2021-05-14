<template>
    <div class="settings_wrapper">
        <div class="settings_underlay" @click="$emit('close', true)"> </div>
        <div class="settings_container">
            <div class="settings_title"> Settings </div>
            <v-btn class="settings_button" color="primary" block @click="$emit('folder', true)"> Change Game Folder </v-btn>
            <v-btn class="settings_button" color="primary" block v-if="file_checking" @click="$emit('filechecks', false)"> Disable File Checks </v-btn>
            <v-btn class="settings_button" color="primary" block v-if="!file_checking" @click="$emit('filechecks', true)"> Enable File Checks </v-btn>
            <v-btn class="settings_button" color="primary" block :loading="check" :disabled="check" @click="$emit('check', true)"> Check Files </v-btn>
        </div>
    </div>
</template>

<script>
export default {
    props: ['check', 'file_checking'],
    computed: {
    filechecks(){
        return localStorage.getItem('checking') || true
    },
    }
}
</script>

<style>
.settings_underlay {
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    z-index: 9;
}

.settings_container {
    z-index: 10;
    background-color: #2C2F33;
    color: white;
    position: absolute;
    width: 30%;
    height: auto;
    top: 30%;
    left: 35%;
    
    box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.9);
}
.settings_title {
    text-align: center;
    font-size: 1.5rem;
    color: white;
    text-decoration-line: underline;
}
.settings_button {
    margin-top: 5px;
}

</style>