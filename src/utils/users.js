const users = []

//addUser removeUser getUser getUsersInRoom

const addUser = ({id, username, room})=>{
    
    //Clean the data
    username = username.trim().toLowerCase() //trim把頭尾空格去掉 然後變成小寫
    room = room.trim().toLowerCase()

    //validate the data
    if (!username || !room) { // no username or room
        return {
            error : 'Username and room are required'
        }
    }

    //查看現有user
    const existingUser = users.find((user) => {//find是回傳第一個為true 的array
        return user.room === room && user.username === username //在同個房間有同樣名字的狀況下才回傳true
    })

    
    //重複username
    if (existingUser) {
        return {
            error : 'Username is in use!'
        }
    }

    //存user
    const user = {id, username, room}
    users.push(user)
    return {user}
}


const removeUser = (id)=>{
    const index = users.findIndex((user)=>{ //findIndex 會回傳遞幾個物件符合
        return user.id === id
    })
    if (index !== -1 ) {
        return users.splice(index, 1)[0] //splice是移除array裡面的element 並回傳名字
    }
}

const getUser = (id)=>{
    const user = users.find((user)=>{
        return user.id === id 
    })
    return user
}

const getUsersInRoom = (room) =>{
    room = room.trim().toLowerCase()
    const existingUser = users.filter((user)=>{
        return user.room === room
    })
    return existingUser
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom,
}