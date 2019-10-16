const socket = io() //把傳送&接收到的資料存進變數

// client (emit)-> server(receive) - acknowledge --server
// server(emit)-> client(receive) - acknowledge --client

//Elements $是代表值來自DOM
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')


//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate =document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-Template').innerHTML

//Option
//解構回傳的object 
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true}) //location.search 是 global 包含href那些 也包query ignore的是把query最前面的問號無視掉

const autoscroll = ()=>{
    //New message element
    const $newMessage = $messages.lastElementChild

    // Height  of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //對話框的長度 可以看到幾個對話
    const visibleHeight = $messages.offsetHeight

    //message container height
    const containerHeight = $messages.scrollHeight

    //往下滑動多少?
    const scrollOffset = $messages.scrollTop + visibleHeight //抓scrollBar的數值 去取到底Scroll多少

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

//接收傳來的圖資
socket.on('locationMessage',(message)=>{
    console.log(message);
    const html = Mustache.render(locationMessageTemplate,{
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('H:mm')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

//接收房間裡有誰的data
socket.on('roomData',({room, users})=>{
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
    
})

//接收訊息
socket.on('message', (message)=>{ //當client 接收到 server 的 emit 'countUpdated' 就會觸發 然後按照emit 變數的順序接收變數
    console.log(message);
    
    //Mustache.render 第一個是抓的template然後第二個是傳入的obeject
    
    const html = Mustache.render(messageTemplate,{
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('H:mm'),
    })
    
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault() //避免刷新

    //代表在submit之後 會 disable
    $messageFormButton.setAttribute('disabled', 'disabled')

    const message = e.target.elements.message.value  //e.target = #message-form 然後elements有message
    
    // console.log(message);
    
    socket.emit('sendMessage',message,(error)=>{
        
        // 訊息成功送出後 利用callback enable
        $messageFormButton.removeAttribute('disabled')
        
        //把訊息欄清空 並起focus他
        $messageFormInput.value=''
        $messageFormInput.focus()
        if (error) {
            return console.log(error);
            
        }
        console.log('The message was delievered');
        
    })
    
})

$sendLocationButton.addEventListener('click',()=>{
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser')
    } 

    $sendLocationButton.setAttribute('disabled','disabled')

    //利用mdn moz://a的api取得LOCATION 然後把經緯度丟到location object裡
    navigator.geolocation.getCurrentPosition( (position)=>{ //not support async
        const location = {  
            latitude : position.coords.latitude, //緯度
            longitude : position.coords.longitude //經度
        } 
        //把圖資傳給sever
        socket.emit('sendLocation', location,()=>{
            $sendLocationButton.removeAttribute('disabled')
            console.log('Location shared');
            
        })
    })
})

socket.emit('join', {username, room}, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})