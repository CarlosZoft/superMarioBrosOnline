const socket = io()

let connectionsEl = document.querySelector('connections')

let players = document.querySelector('.players')



// get public ip
let shareEl = document.querySelector('share').querySelector('input')

let request = new Request('https://api.ipify.org?format=json', {
    method: 'GET',
});

fetch(request).then(function (response) { return response.text() }).then(function (response) {
    response = JSON.parse(response)

    shareEl.value = `http://${response.ip}`
});

shareEl.onmouseenter = function (e) {
    e.target.select()
    document.execCommand('copy')
}


// player logado
socket.on('login', action => {
    connectionsEl.querySelector('li#users').innerHTML = `<li>${action.users} player(s)</li>`

    // player elements
    let player = new Array(parseInt(action.users))

    // seta player na tela

    player.push(`<div class="player-container" id="${action.id}">
                <span class="name">Player</span>
            
                <img src="../public/assets/sprites/mario-1.png" class="player">
            </div>
            `)

    player.forEach(player => {
        players.innerHTML += player
    })

    console.log(`%c Entrou no game: ${action.id}`, "background:green; color:white;")

})

// remove player
socket.on('logout', action => {

    connectionsEl.querySelector('li#users').innerHTML = `<li>${action.users} player(s)</li>`

    let playersContainers = players.querySelectorAll('.player-container')

    playersContainers.forEach(playerContainer => {
        if (playerContainer.id == action.id) {
            playerContainer.remove()
        }
    })

    console.log(`%c Saiu do game: ${action.id}`, "background:orange; color:white;")

})

// emite o evento de tecla pressionada para

document.addEventListener('keypress', (key) => {

    socket.emit('keypress', { key: key.code, id: socket.id })

})

socket.on('connected', (socket) => {
    io.sockets.emit('login', { users, id: socket.id });
})

socket.on('keypressed', event => {

    console.log(`%c Apertou uma tecla (${event.key}): ${event.id}`, "background:blue; color:white;")

    let playerContainer = document.querySelectorAll('.player-container')
    let pcontainer = Array.from(playerContainer)

    let uniqueContainer = pcontainer.find(x => x.id === event.id)

    switch (event.key) {
        case 'Space':
        case 'KeyW':
            socket.emit('player_movement', { position: 'up', id: event.id })
            break;
        case 'KeyA':
            socket.emit('player_movement', { position: 'left', id: event.id })
            break;
        case 'KeyD':
            socket.emit('player_movement', { position: 'right', id: event.id })
            break;
    }

})


socket.on('player_move', (event) => {


    let playerContainer = document.querySelectorAll('.player-container')
    let pcontainer = Array.from(playerContainer)

    let uniqueContainer = pcontainer.find(x => x.id === event.id)

    if (uniqueContainer == undefined) {
        players.innerHTML += `
        <div class="player-container" id="${event.id}">
        <span class="name">Player</span>
        
        <img src="../public/assets/sprites/mario-1.png" class="player">
        </div>
        `
    }

    let currentPlayer = socket.id
    let currentContainer = pcontainer.find(x => x.id === currentPlayer)

    currentContainer.style.zIndex = '2'

    // character control
    const upDeslocation = 60;
    const floorPosition = 11;

    const verticalDeslocationTransition = `0.30s ease-out`
    const horizontalDeslocationTransition = `1s out`

    switch (event.position) {
        case 'up':
            setCharacterPositionUP()
            break;
        case 'left':
            setCharacterPositionLeft()
            break;
        case 'right':
            setCharacterPositionRight()
            break;
    }
    
    function setCharacterPositionUP() {
        uniqueContainer.style.transition = `bottom ${verticalDeslocationTransition}`;
        uniqueContainer.style.bottom = `${upDeslocation}%`
        setTimeout(() => {
            uniqueContainer.style.bottom = `${floorPosition}%`
        }, 200)
    }

    function setCharacterPositionLeft() {
        
        let currentLeft = (window.getComputedStyle(uniqueContainer).left).replace(/\D/g, "")
        let newLeft = (Number(currentLeft) - 10)
        uniqueContainer.style.transition = `left ${horizontalDeslocationTransition}`;
        uniqueContainer.style.left = `${newLeft}px`;
    }

    function setCharacterPositionRight() {
        
        let currentRight = (window.getComputedStyle(uniqueContainer).left).replace(/\D/g, "")
        let newRight = (Number(currentRight) + 10)
        uniqueContainer.style.transition = `left ${horizontalDeslocationTransition}`;
        uniqueContainer.style.left = `${newRight}px`;
    }


})
