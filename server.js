const https = require('https')
const fs = require('fs')
const path = require('path')
const express = require('express')
const helmet = require('helmet')

const PORT = 3000

const app = express()

app.use(helmet())
app.use(express.static(path.join(__dirname, "index", "index.html")))

app.get('/secret', (req,res) => {
    return res.send("it's a secret")
})

app.get('/*', (req,res) => {
    return res.sendFile(path.join(__dirname, "index", "index.html"))
})

const server = https.createServer({
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem')
},app)

server.listen(PORT, () => {
    console.log(`Server on on ${PORT}`);
})