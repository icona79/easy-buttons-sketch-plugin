import BrowserWindow from "sketch-module-web-view";
import { getWebview } from "sketch-module-web-view/remote";
// import UI from "sketch/ui";

import { Page } from "sketch/dom";
import { SymbolMaster } from "sketch/dom";

const webviewIdentifier = "prettybuttons.webview";

var sketch = require("sketch");
var SmartLayout = require("sketch").SmartLayout;
var Text = require("sketch/dom").Text;
var SharedStyle = require("sketch/dom").SharedStyle;

// Document variables
var doc = context.document;
var document = sketch.getSelectedDocument();
var artboard = sketch.Artboard;
// var data = document.sketchObject.documentData();
// var libraries = sketch.getLibraries();
// var symbolReferences;

// ********************************** //
// Button references variables        //
// Edit here the default name         //
// ********************************** //
var buttonName = 'Buttons/Button-default';
var buttonArtboard;
var buttonWidth;
var buttonPaddingHorizontalValue = 16;
var buttonWidthValue = 128;
var buttonHeightValue = 40;
var buttonBackgroundColorValue = "FFFFFF";
var buttonCornerRadius = 0;
var buttonText;
var layerStyles = sketch.getSelectedDocument().sharedLayerStyles;
var textStyles = sketch.getSelectedDocument().sharedTextStyles;
var arrayLayerStyleIDs = layerStyles.map((sharedstyle) => sharedstyle["id"]);
var arrayLayerStyleNames = layerStyles.map((sharedstyle) => sharedstyle["name"]);
var arrayTextStyleIDs = textStyles.map((sharedstyle) => sharedstyle["id"]);
var stylesString = JSON.stringify(layerStyles);
var textString = JSON.stringify(textStyles);
var buttonStyle = 0;
var buttonLayout = 0;
var buttonBackgroundStyleID;
var buttonTextStyleID;
var buttonBackground;
var textWidth;
var xPosition = 0;
var yPosition = 0;

var buttonTextName = "Button Text";
var buttonBackgroundName = "Background";

// ********************************** //
// Button states management variables //
//                                    //
// ********************************** //
const divider = "-";
var states = [];
var layerStatesStyles = [];

states.push(divider + "default");
states.push(divider + "hover");
states.push(divider + "pressed");
states.push(divider + "tab");
states.push(divider + "disabled");

// console.log(layerStyles);
// console.log(arrayLayerStyleIDs);
// console.log(arrayLayerStyleNames);

if (arrayLayerStyleIDs.length > 0) {
    for (let lsi = 0; lsi < layerStyles.length; lsi++) {
        let styleName = arrayLayerStyleNames[lsi];
        let styleID = arrayLayerStyleIDs[lsi];
        for (let i = 0; i < states.length; i++) {
            if (styleName.includes(states[i])) {
                layerStatesStyles.push([styleID, styleName]);
            }
        }
    }
}

// ********************************** //
// Helper variables                   //
//                                    //
// ********************************** //
var xPos = 0;
var yPos = 0;

var existingSymbols = 0;

const buttonSymbolsPage = "Buttons";
var page = selectPage(findOrCreatePage(document, buttonSymbolsPage));

// ********************************** //
// Plugin code                        //
//                                    //
// ********************************** //
export default function() {
    /* Create the webview with the sizes */
    const options = {
        identifier: webviewIdentifier,
        width: 400,
        height: 494,
        show: false,
    };

    const browserWindow = new BrowserWindow(options);

    // only show the window when the page has loaded to avoid a white flash
    browserWindow.once("ready-to-show", () => {
        // Send the list of Text Styles to the plugin webview

        browserWindow.webContents
            .executeJavaScript(
                `fillLayerStylesDropdown(${stylesString}),fillTextStylesDropdown(${textString})`
            )
            .then((result) => {
                // Once we're processing the styles on the webview, we can show it
                browserWindow.show();
            });
    });

    const webContents = browserWindow.webContents;


    // add a handler for a call from web content's javascript
    webContents.on("nativeLog", parameters => {
        // console.log("Configuration: ", parameters);
        /* layout */
        buttonLayout = parameters.buttonLayout;
        buttonPaddingHorizontalValue = parameters.buttonPaddingHorizontalValue;
        buttonWidthValue = parameters.buttonPaddingHorizontalValue;
        buttonHeightValue = parameters.buttonHeightValue;
        buttonCornerRadius = parameters.cornerRadiusValue;
        /* styles */
        buttonStyle = parameters.buttonStyle;
        buttonBackgroundStyleID = parameters.backgroundStyle;
        buttonTextStyleID = parameters.textStyle;
        buttonBackgroundColorValue = parameters.backgroundColorValue;

        setSymbolsInPage();

        /* Create the Artboard which will be the Symbol */
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

        /* text management */
        if (buttonStyle === 0) {
            createTextWithStyle(
                buttonArtboard,
                buttonPaddingHorizontalValue,
                buttonTextStyleID
            );
        } else {
            createTextNoStyle(
                buttonArtboard,
                buttonPaddingHorizontalValue,
                buttonBackgroundColorValue
            );
        }

        let buttonTextHeight = buttonText.frame.height;
        let textYposition = Math.floor(
            (buttonHeightValue - buttonTextHeight) / 2
        );
        buttonText.frame.y = textYposition;

        /* automatic padding if Layout with Smart Layout */
        /* or fized size for the Artboard and center position for the text */
        if (buttonLayout === 0) {
            // console.log("button size based on Smart Layout");
            buttonWidth =
                buttonText.frame.width + 2 * buttonPaddingHorizontalValue;
            buttonText.frame.x = buttonPaddingHorizontalValue;
        } else {
            // console.log("button size based on Fixed Layout");
            buttonWidth = buttonWidthValue;
            buttonText.frame.x = Math.floor(
                (buttonWidthValue - buttonText.frame.width) / 2
            );
        }
        buttonArtboard.frame.width = buttonWidth;
        setPinningOptions(buttonText, true, true, true, true, false, true);

        /* background management */
        if (buttonStyle === 0) {
            backgroundWithStyle(
                buttonArtboard,
                xPosition,
                yPosition,
                buttonWidth,
                buttonHeightValue,
                buttonBackgroundStyleID,
                buttonCornerRadius
            );
        } else {
            backgroundNoStyle(
                buttonArtboard,
                xPosition,
                yPosition,
                buttonWidth,
                buttonHeightValue,
                buttonBackgroundColorValue,
                buttonCornerRadius
            );
        }

        buttonBackground.moveToBack();

        /* create the Symbol */
        var mainSymbol = SymbolMaster.fromArtboard(buttonArtboard);

        /* set Smart Layout */
        if (buttonLayout === 0) {
            setSmartLayout(mainSymbol, "horizontallyCenter");
        }

        mainSymbol.selected = true;

        // console.log(mainSymbol);

        /* Unselect any previously selected item in the canvas */
        document.selectedLayers = [];

        /* Create the states variants */
        CreateSymbolVariants(mainSymbol);

        document.centerOnLayer(mainSymbol);
        doc.setZoomValue(75 / 100);

        browserWindow.close();
    });

    browserWindow.loadURL(require("../resources/webview.html"));
}

// ******************************************************************* //
// Items management support functions                                  //
// ******************************************************************* //

/* Manage the background */
function backgroundNoStyle(selectedLayer, x, y, width, height, color, cornerRadius) {
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
        name: buttonBackgroundName,
    });

    buttonBackground.points.forEach((point) => (point.cornerRadius = backgroundCornerRadius));
    buttonBackground.sketchObject.setFixedRadius(backgroundCornerRadius);
}

function backgroundWithStyle(selectedLayer, x, y, width, height, styleID, cornerRadius) {
    let xPosition = x;
    let yPosition = y;
    let backgroundWidth = width;
    let backgroundHeight = height;
    let backgroundColor = "#ffffff";
    let backgroundStyleID = styleID;
    let backgroundCornerRadius = cornerRadius;

    let index = arrayLayerStyleIDs.indexOf(backgroundStyleID);

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
        name: buttonBackgroundName,
    });

    buttonBackground.sharedStyleId = backgroundStyleID;
    buttonBackground.style = layerStyles[index].style;
    buttonBackground.points.forEach((point) => (point.cornerRadius = backgroundCornerRadius));
    buttonBackground.sketchObject.setFixedRadius(backgroundCornerRadius);

}

/* Manage the text */
function createTextNoStyle(selectedLayer, padding, backgroundColor) {
    let textX = padding;
    let textY = 10;
    let textParent = selectedLayer;
    let textFontSize = 16;
    let textColor = colorContrast(backgroundColor);
    let textLineHeight = 24;
    let textAlignment = "left";
    let textFontFamily = "Open Sans";
    let textFontWeight = 5;
    let textValue = buttonTextName;
    let textName = buttonTextName;

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

function createTextWithStyle(selectedLayer, padding, styleID) {
    let textX = padding;
    let textY = 10;
    let textParent = selectedLayer;
    let textStyleID = styleID
    let textValue = buttonTextName;
    let textName = buttonTextName;

    let index = arrayTextStyleIDs.indexOf(textStyleID);

    buttonText = new Text({
        parent: textParent,
        text: textValue,
    });

    buttonText.frame.x = textX;
    buttonText.frame.y = textY;
    buttonText.sharedStyleId = textStyleID;
    buttonText.style = textStyles[index].style;
    buttonText.name = textName;
}

/* Smart Layout and Pinning Options */
function setPinningOptions(item, fixedLeft, fixedRight, fixedTop, fixedBottom, fixedWidth, fixedHeight) {
    item.hasFixedLeft = fixedLeft;
    item.hasFixedRight = fixedRight;
    item.hasFixedTop = fixedTop;
    item.hasFixedBottom = fixedBottom;
    item.hasFixedWidth = fixedWidth;
    item.hasFixedHeight = fixedHeight;
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

function getNamedChildLayer(parent_layer, name) {
    let new_layer = null;

    parent_layer.layers.forEach(function(item) {
        if (item.name === name) {
            new_layer = item
        }
    });

    return new_layer;
}

// Styles functions //
function getStyleNameFromID(id) {
    let styleName = "";
    for (let i = 0; i < arrayLayerStyleNames.length; i++) {
        if (arrayLayerStyleIDs[i] === id) {
            styleName = arrayLayerStyleNames[i];
        }
    }
    return styleName;
}

function getStyleIDFromName(name) {
    let styleID = ""
    for (let i = 0; i < arrayLayerStyleIDs.length; i++) {
        if (arrayLayerStyleNames[i] === name) {
            styleID = arrayLayerStyleIDs[i];
        }
    }
    return styleID;
}

function getStyleIDFromPartialName(name) {
    let styleID = "";
    for (let i = 0; i < arrayLayerStyleIDs.length; i++) {
        if (arrayLayerStyleNames[i].includes(name)) {
            styleID = arrayLayerStyleIDs[i];
        }
    }
    return styleID;
}
// ******************************************************************* //
// Set the new symbols position in page                                //
// (also the Y position for the next runs of the plugin)               //
// ******************************************************************* //

function setSymbolsInPage() {
    symbolsCounter();

    if (existingSymbols > 0) {
        let lastSymbol = page.layers.slice(-1)[0];

        let lastSymbolY = lastSymbol.frame.y
        let lastSymbolH = lastSymbol.frame.width;
        let lastSymbolX = lastSymbol.frame.x;
        let lastSymbolW = lastSymbol.frame.width;
        // symbols name should not count all the generates button type states
        // count the first created button as variant 01
        let symbolTypeCount = (existingSymbols / states.length) + 1;
        // console.log(lastSymbol.name);

        xPos = 0;
        yPos = lastSymbolY + lastSymbolH + 40;

        let symbolStatus = states[0];
        // console.log(symbolStatus);
        let symbolName = buttonName.replace(symbolStatus, "");
        // console.log(symbolName);
        let symbolIndex = symbolTypeCount.toLocaleString("en", {
            minimumIntegerDigits: 2,
            minimumFractionDigits: 0,
            useGrouping: false,
        });
        //buttonName = symbolName + symbolTypeCount.toString() + symbolStatus;
        buttonName = symbolName + symbolIndex + symbolStatus;
    }
}

function CreateSymbolVariants(mainSymbol) {
    let symbol = mainSymbol;
    let symbolCurrentName = symbol.name;
    let symbolCurrentX = symbol.frame.x;
    let symbolCurrentWidth = symbol.frame.width;

    for (let s = 1; s < states.length; s++) {
        let symbolBaseName = symbolCurrentName;
        if (symbolCurrentName.includes(states[0])) {
            symbolBaseName = symbolCurrentName.replace(states[0], "");
        }

        let newStatusSuffix = states[s];

        let newState = symbol.duplicate();
        let newStateName = symbolBaseName + newStatusSuffix;
        newState.name = newStateName;

        newState.frame.x = symbolCurrentX + symbolCurrentWidth + 40;
        symbolCurrentX = newState.frame.x;

        let internalBackground = getNamedChildLayer(newState, buttonBackgroundName);

        internalBackground.selected = true;

        let layerStatesStylesLength = layerStatesStyles.length;

        if (layerStatesStylesLength > 0) {
            let currentBackgroundStyleName = getStyleNameFromID(
                internalBackground.sharedStyleId
            );
            let currentBackgroundStyleFolders = currentBackgroundStyleName.split("/")[0];
            let currentBackgroundStyleType = currentBackgroundStyleName.split("/").pop().replace(states[0], newStatusSuffix);

            let newBackgroundStyleName = currentBackgroundStyleFolders + "/" + currentBackgroundStyleType;

            let newLayerStyleID = getStyleIDFromName(newBackgroundStyleName);
            if (newLayerStyleID !== "") {
                let localIndex = arrayLayerStyleIDs.indexOf(newLayerStyleID);
                internalBackground.sharedStyleId = newLayerStyleID;
                internalBackground.style = layerStyles[localIndex].style;
            }
        }

        newState.index = symbol.index - s + 1;

        document.selectedLayers = [];
    }
};

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