const { createClient } = require('redis')

const localId = '#' +
    (Math.random() * 0xfffff * 1000000).toString(16) +
    (Math.random() * 0xfffff * 1000000).toString(16) +
    (Math.random() * 0xfffff * 1000000).toString(16)


const client = createClient({
    url: 'redis://redis:6379'
})
const pubClient = client.duplicate()
const subClient = client.duplicate()

client.connect()
pubClient.connect()
subClient.connect()


async function get(key, defaultValue) {
    const value = await client.get(key)
    return value || defaultValue || null
}

async function set(key, value) {
    if (!value) {
        await client.del(key)
    } else
        await client.set(key, value)
}

async function pub(type, payload) {
    payload.publisher = localId
    return pubClient.publish(type, JSON.stringify(payload))
}

async function sub(type, callback) {
    return subClient.subscribe(type, (message) => {
        const payload = JSON.parse(message)
        if (payload.publisher === localId) return
        callback(payload)
    })
}

module.exports = {
    get,
    set,
    del: client.del,
    pub,
    sub
}