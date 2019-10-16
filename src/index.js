const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const {generateMessage, generateLocationMessage} = require('./utils/messages.js')
const {addUser,
    removeUser,
    getUser,
    getUsersInRoom} = require('./utils/users')

const app = express()
const server = http.createServer(app)//利用express再創一個伺服器
const io = socketio(server)//socketio 要傳入一個http server

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

// let count = 0
// server(emit)-> client(receive) - countUpdated
// client (emit)-> server(receive) - addOne


// socket.emit是傳給當前socket訊息 io.emit是傳給所有人 socket.braodcast.emit是傳給除了當前socket的所有人


io.on('connection',(socket) =>{ //第一個宣告是event的宣告 代表如果有connection on 的話 就會做..
                                //把socket丟進函式 socket是物件 有connection的眾多資訊 
    
    console.log('New WebSocket connection');

    

    socket.on('join', ({username, room}, callback)=>{
        
        //物件只有兩種輸出 user或error
        const {error, user } = addUser({id: socket.id, username, room})

        if (error) {
            return callback(error)
        }

        socket.join(user.room)
        
        //io.to(roomName).emit socket.broadcast.to.emit +to()是有在特定房間的
        //socket.io不用改 因為也只送給單一個人

        //send welcome message
        socket.emit('message',generateMessage('Admin','Welcome!')) //把message做成一個object這樣比較彈性
    
        //broadcast 會傳給每個人除了目前的connection
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin',` ${user.username} has joined!`))
        io.to(user.room).emit('roomData',{
            room : user.room,
            users : getUsersInRoom(user.room)
        })

        callback()
    })

    //send溝通的message
    socket.on('sendMessage',(message, callback)=>{
        const filter = new Filter()

        if (filter.isProfane(message)) {
            return callback('No bad words')
        }

        const user = getUser(socket.id)

        io.to(user.room).emit('message',generateMessage(user.username,message))
        callback('Delivered')
    })

    //離開房間
    socket.on('disconnect', ( )=>{
        const user = removeUser(socket.id)

        if (user){

            io.to(user.room).emit('message', generateMessage('admin',`${user.username} has left`))
            io.to(user.room).emit('roomData',{
                room : user.room,
                users : getUsersInRoom(user.room)
            })
        }

    })

    //分享位置
    socket.on('sendLocation', (location, callback)=>{
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage',generateLocationMessage(user.username,`https://google.com/maps?q=${location.latitude},${location.longitude}`))
        callback()
    })
    // socket.emit('countUpdated',count)//從server 丟 event 到 client event叫做countUpdated 然後丟一個count變數

    // socket.on('addOne',()=>{
    //     count++
    //     //socket.emit('countUpdated',count) socket.emit只有傳送給一個用戶
    //     io.emit('countUpdated',count) //廣播給每一個connection
    // })
})

server.listen(port, ()=>{
    console.log('Server is up on port ' + port);
    
})