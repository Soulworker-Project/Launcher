const fs = require('fs');
const { spawn } = require('child_process');
const EventEmitter = require('events')

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


exports.startGame = startGame;