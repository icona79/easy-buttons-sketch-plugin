import BrowserWindow from "sketch-module-web-view";
import { getWebview } from "sketch-module-web-view/remote";
// import UI from "sketch/ui";

import { Page } from "sketch/dom";
import { SymbolMaster } from "sketch/dom";

const webviewIdentifier = "prettybuttons.webview";

var sketch = require("sketch");

// Document variables
var doc = context.document;
var document = sketch.getSelectedDocument();
var artboard = sketch.Artboard;
// var data = document.sketchObject.documentData();
// var libraries = sketch.getLibraries();
// var symbolReferences;

var buttonName = "Buttons/Button";
var buttonArtboard;
var xPos = 0;
var yPos = 0;

var existingSymbols = 0;

const buttonSymbolsPage = "Buttons";
var page = selectPage(findOrCreatePage(document, buttonSymbolsPage));

var LayerID;

export function hello() {
    return "Hello World";
}


export default function() {
    /* This is the Webview size */
    const options = {
        identifier: webviewIdentifier,
        width: 400,
        height: 400,
        show: false,
    };

    const browserWindow = new BrowserWindow(options);

    // only show the window when the page has loaded to avoid a white flash
    browserWindow.once("ready-to-show", () => {
        browserWindow.show();
    });

    const webContents = browserWindow.webContents;

    // print a message when the page loads

    // webContents.on("did-finish-load", () => {
    //     UI.message("UI loaded!");
    // });

    // add a handler for a call from web content's javascript
    webContents.on("nativeLog", parameters => {

        console.log('Configuration: ', parameters);

        var buttonWidth = parameters.buttonWidth;
        var buttonHeight = parameters.buttonHeight;

        setSymbolsInPage();

        console.log("X: " + xPos);

        // Create the Artboard which will be the Symbol
        buttonArtboard = new artboard({
            name: buttonName,
            parent: page,
            frame: {
                x: xPos,
                y: yPos,
                width: buttonWidth,
                height: buttonHeight,
            },
        });

        // var myArtboardLayers = buttonArtboard.layers;
        // orderLayers(myArtboardLayers);

        // Create the Symbol
        var mainSymbol = SymbolMaster.fromArtboard(buttonArtboard);

        console.log(mainSymbol);

        document.centerOnLayer(mainSymbol);
        doc.setZoomValue(75 / 100);


        browserWindow.close();
    });

    browserWindow.loadURL(require("../resources/webview.html"));
}

// ******************************************************************* //
// Pages management support functions                                  //
// ******************************************************************* //
function findOrCreatePage(document, name) {
    const [page] = document.pages.filter(page => page.name === name);

    if (!page) {
        return new Page({
            name,
            parent: document,
        });
    } else {
        return page;
    }
}

function findOrCreateSymbolPage(document) {
    const page = Page.getSymbolsPage(document);
    if (page) {
        return page;
    }
    const symbolsPage = Page.createSymbolsPage();
    symbolsPage.parent = document;
    return symbolsPage;
}

function selectPage(page) {
    page.selected = true;
    return page;
}

function setSymbolsInPage() {
    symbolsCounter();

    if (existingSymbols > 0) {
        var lastSymbol = page.layers.slice(-1)[0];

        // console.log(lastSymbol.name);

        var lastSymbolX = lastSymbol.frame.x;
        var lastSymbolW = lastSymbol.frame.width;
        // var lastSymbolY = lastSymbol.frame.y;
        // var lastSymbolH = lastSymbol.frame.height;

        xPos = lastSymbolX + lastSymbolW + 100;
        //yPos = lastSymbolY + 100;

        //console.log("Counter: " + existingSymbols);
        buttonName = buttonName + existingSymbols.toString();
    }
}

function symbolsCounter() {
    var currentPage = doc.currentPage();
    var listOfSymbols = currentPage.symbols();

    existingSymbols = listOfSymbols.count();
}

// ******************************************************************* //
// When the plugin is shutdown by Sketch (for example when the user    //
// disable the plugin) we need to close the webview if it's open       //
// ******************************************************************* //
export function onShutdown() {
    const existingWebview = getWebview(webviewIdentifier)
    if (existingWebview) {
        existingWebview.close()
    }
}