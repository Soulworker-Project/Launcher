const fetch = require('node-fetch');
const md5 = require('md5')
const fs = require('fs');
const EventEmitter = require('events');

function download(url, filename, filepath, md5hash) {
    return new Promise(async (resolve, reject) => {
        const res = await fetch(url);
        const stream = fs.createWriteStream(filepath + filename);
        res.body.pipe(stream);
        res.body.on('error', reject);
        stream.on('finish', () => {
            fs.readFile(filepath + filename, (err, data) => {
                if(err) reject(err);
                if(!err) {
                    const hash = md5(data);
                    hash == md5hash ? resolve(true) : reject("Hash error")
                }
            })
        })
    })
}

async function downloadGame(gamepath, manifest) {
    const events = new EventEmitter()
    if(!gamepath.endsWith('/') || !gamepath.endsWith("\\")) gamepath = gamepath + "/"
    if(!fs.existsSync(gamepath)) return;
    const baseurl = manifest.base;
    delete manifest.base;
    //Return and then work afterwords
    setTimeout(async () => {
        var keys = Object.keys(manifest);
        var sum = 0;
        var current = 0;

        await asyncForEach(keys, async (key, index) => {
            if(typeof key == "object") {
                await asyncForEach(Object.keys(key), async (key, index) => {
                    sum++;
                })
            }
            sum++;
        })
        events.emit("sum", sum)

        await asyncForEach(keys, async (key, index) => {
            if(typeof key == "object") {
                var sub = Object.keys(key)
                await asyncForEach(sub, async (name, i) => {
                    events.emit("download", key + name)
                    await download(baseurl + key + name, name, gamepath + key, sub[name]).catch((error) => {events.emit('error', error)})
                    current++;
                    events.emit('current', current)
                })
            }else if(typeof key == "string") {
                events.emit("download", key)
                await download(baseurl + key, key, gamepath, manifest[key]).catch((error) => {events.emit('error', error)})
                current++;
                events.emit('current', current)
            }
        })
    }, 1);

    return events;
}

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
    }
}

exports.downloadGame = downloadGame;