const checkDiskSpace = require('check-disk-space')

function getSpace(path){
    return new Promise((resolve, reject) => {
        checkDiskSpace('C:/blabla/bla').then((diskSpace) => {
            resolve(diskSpace)
        })
    })
}

export {getSpace}