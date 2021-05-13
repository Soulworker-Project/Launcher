const fetch = require('node-fetch');
const md5 = require('md5')
const fs = require('fs');
const EventEmitter = require('events');
const Progress = require('node-fetch-progress')

async function download(url, filename, filepath, md5hash) {
    const events = new EventEmitter()
        if(!fs.existsSync(filepath)) fs.mkdirSync(filepath)
        const res = await fetch(url);
        const progress = new Progress(res, { throttle: 100 })
        progress.on('progress', (p) => {
            events.emit("progress", p)
        })
        const stream = fs.createWriteStream(filepath + filename);
        res.body.pipe(stream);
        res.body.on('error', (error) => {events.emit('err', error)});
        stream.on('finish', () => {
            events.emit('finish', true)
        })
    return events;
}

async function downloadGame(gamepath, manifest) {
    const events = new EventEmitter()
    if(!gamepath.endsWith('/') || !gamepath.endsWith("\\")) gamepath = gamepath + "/"
    if(!fs.existsSync(gamepath)) return;
    const baseurl = manifest.base;
    delete manifest.base;
    //Return and then work afterwords
    events.on('start', async () => {
        var keys = Object.keys(manifest);
        var sum = 0;
        var current = 0;

        await asyncForEach(keys, async (key, index) => {
            if(typeof manifest[key] == "object") {
                await asyncForEach(Object.keys(manifest[key]), async (key, index) => {
                    sum++;
                })
            }
            sum++;
        })
        events.emit("sum", sum)

        await asyncForEach(keys, async (key, index) => {
            if(typeof manifest[key] == "object") {
                var sub = Object.keys(manifest[key])
                var folder = key + "/"
                await asyncForEach(sub, async (name, i) => {
                    events.emit("download", folder + name)
                    var d = await download(baseurl + folder + name, name, gamepath + folder, sub[name])
                    d.on('progress', (data) => {events.emit("progress", data)})
                    d.on('err', (data) => {events.emit("err", data)})
                    await new Promise((resolve) => {d.on('finish', () => {resolve(true)})})
                    current++;
                    events.emit('current', current)
                })
            }else if(typeof manifest[key] == "string") {
                events.emit("download", key)
                var d = await download(baseurl + key, key, gamepath, manifest[key])
                d.on('progress', (data) => {events.emit("progress", data)})
                d.on('err', (data) => {events.emit("err", data)})
                await new Promise((resolve) => {d.on('finish', () => {resolve(true);})})
                current++;
                events.emit('current', current)
            }
        })
        events.emit("done", true)
    })
    return events;
}

async function checkGame(gamepath, manifest) {
    const events = new EventEmitter()
    if(!gamepath.endsWith('/') || !gamepath.endsWith("\\")) gamepath = gamepath + "/"
    
    const baseurl = manifest.base;
    delete manifest.base;
    //Return and then work afterwords
    events.on("start", async () => {
        var keys = Object.keys(manifest);
        var sum = 0;
        var current = 0;

        await asyncForEach(keys, async (key, index) => {
            if(typeof manifest[key] == "object") {
                await asyncForEach(Object.keys(manifest[key]), async (key, index) => {
                    sum++;
                })
            }
            sum++;
        })
        events.emit("sum", sum)

        await asyncForEach(keys, async (key, index) => {
            if(typeof manifest[key] == "object") {
                var sub = Object.keys(manifest[key])
                await asyncForEach(sub, async (name, i) => {
                    var folder = key + "/"
                    events.emit("check", folder + name)
                    try {
                        var size = fs.statSync(gamepath + folder + name)['size']
                        if(md5(size) == manifest[key][name]) {}else{
                            events.emit("download", folder + name)
                            var d = await download(baseurl + folder + name, name, gamepath + folder, manifest[key][name])
                            d.on('progress', (data) => {events.emit("progress", data)})
                            d.on('err', (data) => {events.emit("err", data)})
                            await new Promise((resolve) => {d.on('finish', () => {resolve(true)})})
                        }   
                    } catch (error) {
                        events.emit("download", folder + name)
                        events.emit("err", error)
                        var d = await download(baseurl + folder + name, name, gamepath + folder, manifest[key][name])
                        d.on('progress', (data) => {events.emit("progress", data)})
                        d.on('err', (data) => {events.emit("err", data)})
                        await new Promise((resolve) => {d.on('finish', () => {resolve(true)})})
                    }
                    current++;
                    events.emit('current', current)
                })
            }else if(typeof manifest[key] == "string") {
                events.emit("check", key)
                try {
                    var size = fs.statSync(gamepath + key)['size']
                    if(md5(size) == manifest[key]) {}else{
                        events.emit("download", key)
                        var d = await download(baseurl + key, key, gamepath, manifest[key])
                        d.on('progress', (data) => {events.emit("progress", data)})
                        d.on('err', (data) => {events.emit("err", data)})
                        await new Promise((resolve) => {d.on('finish', () => {resolve(true)})})
                    }   
                } catch (error) {
                    events.emit("err", error)
                    events.emit("download", key)
                    var d = await download(baseurl + key, key, gamepath, manifest[key])
                    d.on('progress', (data) => {events.emit("progress", data)})
                    d.on('err', (data) => {events.emit("err", data)})
                    await new Promise((resolve) => {d.on('finish', () => {resolve(true)})})
                }
                current++;
                events.emit('current', current)
            }
        })
        events.emit("done", true)
    })

    return events;
}

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
    }
}

export {downloadGame, checkGame}