import { watch } from 'fs';
import { WebSocketServer } from 'ws';

// WebSocket server on port 8080
const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', (ws) => {
    console.log('Client connected for hot reload');
});

// Function to send reload command to all clients
function sendReloadCommand() {
    wss.clients.forEach((client) => {
        if (client.readyState === client.OPEN) {
            client.send('reload');
        }
    });
}

// Watch for file changes
const fileToWatch = './src';
let timeout;

watch(fileToWatch, { recursive: true }, (eventType, fileName) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
        console.log(`${fileName} was updated. Sending reload command...`);
        sendReloadCommand();
    }, 100); // Debounce for 100ms to avoid duplicate reloads
});