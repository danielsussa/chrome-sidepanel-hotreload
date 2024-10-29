# Creating Hot Reload for a Chrome Side Panel Extension Using File System and WebSocket
Developing a Chrome side panel extension with hot reload requires some creativity due to Chrome’s restrictions on accessing localhost directly. In this tutorial, we’ll use the Node.js fs module to watch files in our project folder for changes and then trigger a hot reload in the Chrome side panel extension.

Prerequisites
To follow along, you’ll need:

- Node.js installed
- Basic knowledge of Chrome extensions and WebSocket

## Step 1: Setting Up the Chrome Side Panel Extension
First, let’s set up a basic Chrome extension with a side panel.

`manifest.json`
This manifest defines a side panel extension and specifies a background.js file to handle background tasks.

```json
{
    "manifest_version": 3,
    "name": "Side Panel Hot Reload",
    "version": "1.0",
    "description": "Chrome extension with side panel and hot-reload support.",
    "permissions": ["sidePanel"],
    "background": {
      "service_worker": "background.js"
    },
    "side_panel": {
      "default_path": "src/panel.html"
    }
}
```
`panel.html`
This HTML file serves as the entry point for your side panel’s content:

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Side Panel</title>
    </head>
    <body>
        <div id="app">Hello from the Side Panel!</div>
        <script src="hot_reload.js"></script>
    </body>
</html>
```

## Step 2: Create a WebSocket Server with File System Watching
To detect file changes and notify the Chrome extension, we’ll set up a WebSocket server in Node.js that watches files in the project folder. When a change is detected, the WebSocket server will send a reload message to the side panel.

Install WebSocket Library:

We’ll use ws to set up a WebSocket server.

- bash
```sh
npm install ws
```
Create a Node.js Script to Watch Files and Set Up WebSocket:

Here’s a complete script to watch the src directory for changes, using fs.watch to monitor files and ws for WebSocket communication.

```javascript
// watch.js
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
```
This script:

- Starts a WebSocket server on port 8080.
- Watches the src directory for file changes and triggers a reload message with a short debounce to avoid multiple reloads.

## Step 3: Connect the Side Panel to the WebSocket
In your hot_reload.js file, connect to the WebSocket server and listen for reload messages. When a reload message is received, the script will reload the side panel by calling window.location.reload().

```javascript
// hot_reload.js

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
```
This script will:

- Connect to the WebSocket server running on ws://localhost:8080.
- Reload the page whenever a reload message is received.
- Attempt to reconnect if the WebSocket connection is closed, useful in case of any connection interruptions.

## Step 4: Running the Development Server and Loading the Extension
Run the Node.js Server:

Start the Node.js server to enable file watching and WebSocket communication:

```bash
node watch.js
```
Load the Unpacked Extension in Chrome:

- Go to chrome://extensions.
- Enable "Developer mode."
- Click on "Load unpacked" and select your extension folder.

Open the Side Panel:

Open Chrome and go to the side panel to see your extension’s content.
When you make changes in the src folder, the WebSocket server will detect the changes and trigger a reload in the side panel.

## Additional Tips
- **Adjusting the Debounce:**  You can increase or decrease the debounce delay in the file-watching function to control how often the reload is triggered.
- **Error Handling**: Add error handling to log any issues with file changes or WebSocket connections to ensure smooth development.

## Conclusion
By leveraging Node.js file watching and WebSocket, you can create an efficient hot-reload setup for a Chrome side panel extension without needing a bundler like Vite. This setup allows you to make changes quickly and see them reflected in your extension without the hassle of manual reloading.

This setup offers a lightweight and effective way to develop Chrome extensions with a side panel, saving you time and enhancing your development experience.