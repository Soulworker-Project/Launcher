const checkDiskSpace = require('check-disk-space')

function getSpace(path){
    return new Promise((resolve, reject) => {
        checkDiskSpace(path).then((diskSpace) => {
            resolve(diskSpace)
        })
    })
}

export {getSpace}