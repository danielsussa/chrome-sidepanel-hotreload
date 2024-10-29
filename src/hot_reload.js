
function startWebSocket() {
    let ws = new WebSocket('ws://localhost:8080');
    ws.onopen = () => {
        ws.onmessage = (event) => {
            if (event.data === 'reload') {
                console.log('Received reload command. Reloading...');
                window.location.reload();
            }
        };
    }

    ws.onclose = () => {
        console.log('WebSocket connection closed. Attempting to reconnect...');
        setTimeout(startWebSocket, 1000); // Reconnect after 1 second
    };
}

startWebSocket()