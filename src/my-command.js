import BrowserWindow from "sketch-module-web-view";
import { getWebview } from "sketch-module-web-view/remote";
// import UI from "sketch/ui";

import { Page } from "sketch/dom";
import { SymbolMaster } from "sketch/dom";

const webviewIdentifier = "prettybuttons.webview";

var sketch = require("sketch");
var SmartLayout = require("sketch").SmartLayout;
var Text = require("sketch/dom").Text;

// Document variables
var doc = context.document;
var document = sketch.getSelectedDocument();
var artboard = sketch.Artboard;
// var data = document.sketchObject.documentData();
// var libraries = sketch.getLibraries();
// var symbolReferences;

var buttonName = "Buttons/Button";
var buttonArtboard;
var buttonText;
var buttonBackground;
var textWidth;
var xPosition = 0;
var yPosition = 0;

var xPos = 0;
var yPos = 0;

var existingSymbols = 0;

const buttonSymbolsPage = "Buttons";
var page = selectPage(findOrCreatePage(document, buttonSymbolsPage));


export default function() {
    /* This is the Webview size */
    const options = {
        identifier: webviewIdentifier,
        width: 400,
        height: 336,
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

        var buttonPaddingHorizontalValue = parameters.buttonPaddingHorizontalValue;
        var buttonHeightValue = parameters.buttonHeightValue;
        var buttonBackgroundColorValue = parameters.backgroundColorValue;
        var buttonCornerRadius = parameters.cornerRadiusValue;

        setSymbolsInPage();

        // Create the Artboard which will be the Symbol
        buttonArtboard = new artboard({
            name: buttonName,
            parent: page,
            frame: {
                x: xPos,
                y: yPos,
                width: 200,
                height: buttonHeightValue,
            },
        });

        createText(buttonArtboard, buttonPaddingHorizontalValue, buttonBackgroundColorValue);

        console.log(buttonText);

        var buttonWidth = buttonText.frame.width + (2 * buttonPaddingHorizontalValue);

        buttonArtboard.frame.width = buttonWidth;
        let buttonTextHeight = buttonText.frame.height
        let textYposition = Math.floor((buttonHeightValue - buttonTextHeight) / 2);
        buttonText.frame.y = textYposition

        background(
            buttonArtboard,
            xPosition,
            yPosition,
            buttonWidth,
            buttonHeightValue,
            buttonBackgroundColorValue,
            buttonCornerRadius
        );

        buttonBackground.moveToBack();

        // Create the Symbol
        var mainSymbol = SymbolMaster.fromArtboard(buttonArtboard);

        // set Smart Layout
        setSmartLayout(mainSymbol, "horizontallyCenter");

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
    buttonBackground = new ShapePath({
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

    buttonBackground.points.forEach((point) => (point.cornerRadius = backgroundCornerRadius));
    buttonBackground.sketchObject.setFixedRadius(backgroundCornerRadius);

    //console.log(background);
}

function createText(selectedLayer, padding, backgroundColor) {
    let textX = padding;
    let textY = 10;
    let textParent = selectedLayer;
    let textFontSize = 16;
    let textColor = colorContrast(backgroundColor);
    let textLineHeight = 24;
    let textAlignment = "left";
    let textFontFamily = "Open Sans";
    let textFontWeight = 5;
    let textValue = "Hello!";
    let textName = "Text Layer";

    buttonText = new Text({
        parent: textParent,
        text: textValue,
    });

    buttonText.frame.x = textX;
    buttonText.frame.y = textY;
    buttonText.style.fontSize = textFontSize;
    buttonText.style.textColor = textColor;
    buttonText.style.lineHeight = textLineHeight;
    buttonText.style.alignment = textAlignment;
    buttonText.style.fontFamily = textFontFamily;
    buttonText.style.fontWeight = textFontWeight;

    buttonText.name = textName;
}

function setPinningOptions() {
    layer.hasFixedLeft = true;
    layer.hasFixedRight = false;
    layer.hasFixedTop = false;
    layer.hasFixedBottom = false;

    layer.hasFixedWidth = true;
    layer.hasFixedHeight = true;
}

function setSmartLayout(item, type) {
    let smartLayoutType = type
    switch (smartLayoutType) {
        case "LeftToRight":
            return item.smartLayout = SmartLayout.LeftToRight;
        case "horizontallyCenter":
            return item.smartLayout = SmartLayout.HorizontallyCenter;
        case "RightToLeft":
            return item.smartLayout = SmartLayout.RightToLeft;
        case "TopToBottom":
            return item.smartLayout = SmartLayout.TopToBottom;
        case "VerticallyCenter":
            return item.smartLayout = SmartLayout.VerticallyCenter;
        case "BottomToTop":
            return item.smartLayout = SmartLayout.BottomToTop;
    }
}

// ******************************************************************* //
// Color management support functions                                  //
// ******************************************************************* //
function colorContrast(color) {
    var r = hexToRgb(color).r;
    var g = hexToRgb(color).g;
    var b = hexToRgb(color).b;
    var rB = 255,
        gB = 255,
        bB = 255;
    var rN = 0,
        gN = 0,
        bN = 0;

    var cB = Math.abs(r - rB) + Math.abs(g - gB) + Math.abs(b - bB);
    var br1 = 299 * r + 587 * g + 114 * b;
    var br2 = 299 * rB + 587 * gB + 114 * bB;
    var dB = Math.abs(br1 - br2);

    var cN = Math.abs(r - rN) + Math.abs(g - gN) + Math.abs(b - bN);
    br2 = 299 * rN + 587 * gN + 114 * bN;
    var dN = Math.abs(br1 - br2);

    if (cB > 500 && dB > 125) {
        return "#ffffff";
    } else if (cN > 500 && dN > 125) {
        return "#000000";
    } else {
        if (0.2 * cB + 0.8 * dB > 0.2 * cN + 0.8 * dN) {
            return "#ffffff";
        } else {
            return "#000000";
        }
    }
}

function hexToRgb(hex) {
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
        return r + r + g + g + b + b;
    });

    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
        } :
        null;
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