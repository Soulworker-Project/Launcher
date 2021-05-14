const fs = require('fs');
const { spawn } = require('child_process');
const EventEmitter = require('events')
const ini = require('ini')

    function startGame (path, ip, port) {
        const eventEmitter = new EventEmitter()
        let game = spawn(`${path}/SoulWorker100.exe`, [`IP:${ip}`, `PORT:${port}`, 'MultiExecuteClient:yes', 'SkipWMModule:yes'], {cwd: `${path}`})

        game.on('exit', (code) => {
            eventEmitter.emit('stop', true)
        });

        eventEmitter.on('kill', () => {
            game.kill();
        })


        return eventEmitter;
    }

    function getVersion(path) {
        try {
            console.log(path)
            if(!path.endsWith('/')) path = path + '/';
            var ver = fs.readFileSync(path + 'Ver.ini', 'utf-8')
            return ini.parse(ver).Client.ver
        } catch (error) {
            console.log(error)
            return 'Unkown'   
        }
    }


export {startGame, getVersion}