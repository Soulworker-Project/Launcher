const path = __dirname;
const files = path + "/language/";
export default async (context, inject) => {
    
    const available = [
        'en',
        'de'
    ]

    function gettranslation(language, key){
        if(available.includes(language)){
            var selected = require(`./language/${language}.json`);
            return selected[key];
        }else{
            return 'Language error!'
        }
    }

    function getAvailablelanguage(){
        return available;
    }

    var language = {
        gettranslation, 
        getAvailablelanguage
    }

    inject('lang', language)
    context.$lang = language
}