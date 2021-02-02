import BrowserWindow from 'sketch-module-web-view'
import { getWebview } from 'sketch-module-web-view/remote'
import UI from 'sketch/ui'

const webviewIdentifier = 'prettybuttons.webview'

export default function() {
    /* This is the Webview size */
    const options = {
        identifier: webviewIdentifier,
        width: 400,
        height: 400,
        show: false
    }

    const browserWindow = new BrowserWindow(options)

    // only show the window when the page has loaded to avoid a white flash
    browserWindow.once('ready-to-show', () => {
        browserWindow.show()
    })

    const webContents = browserWindow.webContents

    // print a message when the page loads

    webContents.on('did-finish-load', () => {
        UI.message('UI loaded!')
    })

    // add a handler for a call from web content's javascript
    webContents.on('nativeLog', parameters => {
        console.log(parameters.inputText);
        console.log(parameters.dropdownValue);

        //browserWindow.close();

        // webContents
        //     .executeJavaScript(`setRandomNumber(${Math.random()})`)
        //     .catch(console.error)
    })

    browserWindow.loadURL(require('../resources/webview.html'))
}

// When the plugin is shutdown by Sketch (for example when the user disable the plugin)
// we need to close the webview if it's open
export function onShutdown() {
    const existingWebview = getWebview(webviewIdentifier)
    if (existingWebview) {
        existingWebview.close()
    }
}