import BrowserWindow from "sketch-module-web-view";
import { getWebview } from "sketch-module-web-view/remote";
// import UI from "sketch/ui";

import { Page } from "sketch/dom";
import { SymbolMaster } from "sketch/dom";

const webviewIdentifier = "prettybuttons.webview";

var sketch = require("sketch");
var SmartLayout = require("sketch").SmartLayout;

// Document variables
var doc = context.document;
var document = sketch.getSelectedDocument();
var artboard = sketch.Artboard;
// var data = document.sketchObject.documentData();
// var libraries = sketch.getLibraries();
// var symbolReferences;

var buttonName = "Buttons/Button";
var buttonArtboard;
var xPosition = 0;
var yPosition = 0;

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

        // console.log('Configuration: ', parameters);

        var buttonWidthValue = parameters.buttonWidthValue;
        var buttonHeightValue = parameters.buttonHeightValue;
        var buttonBackgroundColorValue = parameters.backgroundColorValue;
        var buttonCornerRadius = parameters.cornerRadiusValue;

        setSymbolsInPage();

        // console.log("X: " + xPos);

        // Create the Artboard which will be the Symbol
        buttonArtboard = new artboard({
            name: buttonName,
            parent: page,
            frame: {
                x: xPos,
                y: yPos,
                width: buttonWidthValue,
                height: buttonHeightValue,
            },
        });

        background(
            buttonArtboard,
            xPosition,
            yPosition,
            buttonWidthValue,
            buttonHeightValue,
            buttonBackgroundColorValue,
            buttonCornerRadius,
        );

        // var myArtboardLayers = buttonArtboard.layers;
        // orderLayers(myArtboardLayers);

        // Create the Symbol
        var mainSymbol = SymbolMaster.fromArtboard(buttonArtboard);
        // set Smart Layout
        console.log("before");
        mainSymbol.smartLayout = SmartLayout.HorizontallyCenter;
        console.log("after");
        // console.log(mainSymbol);

        document.centerOnLayer(mainSymbol);
        doc.setZoomValue(75 / 100);


        browserWindow.close();
    });

    browserWindow.loadURL(require("../resources/webview.html"));
}

// ******************************************************************* //
// Items management support functions                                  //
// ******************************************************************* //
function background(selectedLayer, x, y, width, height, color, cornerRadius) {
    let xPosition = x;
    let yPosition = y;
    let backgroundWidth = width;
    let backgroundHeight = height;
    let backgroundColor = "#" + color;
    let backgroundCornerRadius = cornerRadius;

    let ShapePath = sketch.ShapePath;
    let mySquare = new ShapePath({
        parent: selectedLayer,
        frame: {
            x: xPosition,
            y: yPosition,
            width: backgroundWidth,
            height: backgroundHeight,
        },
        style: { fills: [backgroundColor], borders: [] },

        name: "Background",
    });

    mySquare.points.forEach((point) => (point.cornerRadius = backgroundCornerRadius));
    mySquare.sketchObject.setFixedRadius(backgroundCornerRadius);

    console.log(mySquare);
}

function setPinningOptions() {
    layer.hasFixedLeft = true;
    layer.hasFixedRight = false;
    layer.hasFixedTop = false;
    layer.hasFixedBottom = false;

    layer.hasFixedWidth = true;
    layer.hasFixedHeight = true;
}

function setSmartLayout(type = 0) {
    switch (type) {
        case 0:
            return "LeftToRight";
        case 1:
            return "HorizontallyCenter";
        case 2:
            return "RightToLeft";
        case 3:
            return "TopToBottom";
        case 4:
            return "VerticallyCenter";
        case 5:
            return "BottomToTop";
    }
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