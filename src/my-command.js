import BrowserWindow from "sketch-module-web-view";
import { getWebview } from "sketch-module-web-view/remote";
// import UI from "sketch/ui";

import { Page } from "sketch/dom";
import { SymbolMaster } from "sketch/dom";

const webviewIdentifier = "prettybuttons.webview";

var sketch = require("sketch");
var SmartLayout = require("sketch").SmartLayout;
var Group = require("sketch/dom").Group;
var Text = require("sketch/dom").Text;
var SharedStyle = require("sketch/dom").SharedStyle;
var HotSpot = require("sketch/dom").HotSpot;
var Flow = require("sketch/dom").Flow;

// Document variables
var doc = context.document;
var document = sketch.getSelectedDocument();

// var data = document.sketchObject.documentData();
// var libraries = sketch.getLibraries();
// var symbolReferences;

// ********************************** //
// Button references variables        //
// Edit here the default name         //
// ********************************** //
var buttonName = "Buttons/Button-default";
var buttonArtboard;
var buttonWidth = 96;
var buttonPaddingHorizontalValue = 16;
var buttonWidthValue = 96;
var buttonHeightValue = 40;
var buttonBackgroundColorValue = "FFFFFF";
var buttonCornerRadius = 0;
var buttonIcon;
var buttonText;
var buttonContent;
var layerStyles = document.sharedLayerStyles;
var textStyles = document.sharedTextStyles;
var arrayLayerStyleIDs = layerStyles.map((sharedstyle) => sharedstyle["id"]);
var arrayLayerStyleNames = layerStyles.map(
    (sharedstyle) => sharedstyle["name"]
);
var arrayLayerStyleStyles = layerStyles.map(
    (sharedstyle) => sharedstyle["style"]
);
var arrayTextStyleIDs = textStyles.map((sharedstyle) => sharedstyle["id"]);
var arrayTextStyleNames = textStyles.map((sharedstyle) => sharedstyle["name"]);
var arrayTextStyleStyles = textStyles.map(
    (sharedstyle) => sharedstyle["style"]
);
var stylesString = JSON.stringify(layerStyles);
var textString = JSON.stringify(textStyles);

var buttonStyle = 0;
var buttonLayout = 0;
var buttonType = 0;
var buttonBackgroundStyleID;
var buttonTextStyleID;
var buttonBackground;
var buttonHotspot;
var overrideOptionsToLock = ["textStyle", "layerStyle"];
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

// ********************************** //
// Helper variables                   //
// ********************************** //
var xPos = 0;
var yPos = 0;

var symbolCounter = 0;

// TODO: create or move to the Button's page when hoit the Create button only //
const buttonSymbolsPage = "Buttons";
var page = selectPage(findOrCreatePage(document, buttonSymbolsPage));

// ********************************** //
// Plugin code                        //
// ********************************** //
export default function() {
    /* Create the webview with the sizes */
    const options = {
        identifier: webviewIdentifier,
        width: 400,
        height: 533,
        show: false,
    };

    const browserWindow = new BrowserWindow(options);

    // only show the window when the page has loaded to avoid a white flash
    browserWindow.once("ready-to-show", () => {
        // Send the list of Text Styles to the plugin webview
        try {
            browserWindow.webContents
                .executeJavaScript(
                    `fillLayerStylesDropdown(${stylesString}),fillTextStylesDropdown(${textString})`
                )
                .then((result) => {
                    // Once we're processing the styles on the webview, we can show it
                    browserWindow.show();
                });
        } catch (createWebViewErr) {
            console.log(createWebViewErr);
        }
    });

    const webContents = browserWindow.webContents;

    // add a handler for a call from web content's javascript
    webContents.on("nativeLog", (parameters) => {
        try {
            // ********************************** //
            // Import Parameters from the Webview //
            // ********************************** //
            // console.log("Configuration: ", parameters);
            /* type */
            buttonType = parseInt(parameters.buttonType);
            /* layout */
            buttonLayout = parseInt(parameters.buttonLayout);
            buttonPaddingHorizontalValue = parseInt(
                parameters.buttonPaddingHorizontalValue
            );

            buttonWidthValue = parseInt(
                parameters.buttonPaddingHorizontalValue
            );

            buttonHeightValue = parseInt(parameters.buttonHeightValue);
            buttonCornerRadius = parseInt(parameters.cornerRadiusValue);
            /* styles */
            buttonStyle = parseInt(parameters.buttonStyle);
            buttonBackgroundStyleID = parameters.backgroundStyle;
            buttonTextStyleID = parameters.textStyle;
            buttonBackgroundColorValue = parameters.backgroundColorValue;

            // ********************************** //
            // Define the text and icon color     //
            // ********************************** //
            let textStyleSelected = [];
            let frontColor = "";
            if (buttonStyle === 0) {
                textStyleSelected = getTextStyleNameFromID(buttonTextStyleID);
                frontColor = textStyleSelected.textColor;
            } else {
                frontColor = colorContrast(buttonBackgroundColorValue);
            }

            /* Organize the button page */
            setSymbolsInPage();

            // ********************************** //
            // Button creation                    //
            // ********************************** //
            /* Create the Artboard which will be the Symbol */
            buttonArtboard = createArtboard(
                page,
                xPos,
                yPos,
                buttonWidth,
                buttonHeightValue,
                buttonName
            );

            /* Manage the button text (only for button type 0 & 1) */
            let buttonTextHeight = 0;
            let buttonTextYPosition = 0;

            if (buttonType === 0 || buttonType === 1) {
                /* text management */
                if (buttonStyle === 0) {
                    buttonText = createTextWithStyle(
                        buttonArtboard,
                        buttonPaddingHorizontalValue,
                        buttonTextStyleID
                    );
                } else {
                    let lineHeight = 20;
                    let fontSize = 16;
                    if (buttonHeightValue <= 32) {
                        fontSize = 12;
                        lineHeight = 14;
                    } else if (buttonHeightValue < 56) {
                        fontSize = 16;
                        lineHeight = 20;
                    } else if (buttonHeightValue >= 56) {
                        fontSize = 20;
                        lineHeight = 28;
                    }

                    buttonText = createTextNoStyle(
                        buttonArtboard,
                        buttonPaddingHorizontalValue,
                        buttonBackgroundColorValue,
                        "center",
                        fontSize,
                        lineHeight
                    );

                    createNewTextStyle(buttonText, buttonName, true, false);
                }

                buttonTextHeight = buttonText.frame.height;
                buttonTextYPosition = Math.floor(
                    (buttonHeightValue - buttonTextHeight) / 2
                );
                buttonText.frame.y = buttonTextYPosition;
            }

            /* Manage the button icon (only for button type 1 & 2) */
            let iconSize = 0;
            let iconPaddingH = 0; // Horizontal padding
            let iconPaddingV = 0; // Vertical padding
            var iconSpace = 0; // Horizontal Space occupied from the icon and its left padding (the right padding is part of the text)

            try {
                if (buttonType === 1) {
                    if (buttonLayout === 0) {
                        iconSize = buttonTextHeight;
                        iconPaddingH = buttonTextYPosition;
                    } else {
                        if (buttonHeightValue <= 32) {
                            iconSize = buttonTextHeight;
                            iconPaddingH = 8;
                        } else if (buttonHeightValue < 56) {
                            iconSize = buttonTextHeight;
                            iconPaddingH = 16;
                        } else if (buttonHeightValue >= 56) {
                            iconSize = buttonTextHeight;
                            iconPaddingH = 24;
                        }
                    }
                    iconPaddingV = (buttonHeightValue - iconSize) / 2;
                    iconSpace = iconSize + iconPaddingH;

                    buttonIcon = createShapePath(
                        buttonArtboard,
                        buttonPaddingHorizontalValue,
                        iconPaddingV,
                        iconSize,
                        iconSize,
                        frontColor,
                        "",
                        "Icon"
                    );

                    /* set the icon contraint option */
                    setResizingConstraint(
                        buttonIcon, [false, false, false, false], [true, true]
                    );
                } else if (buttonType === 2) {
                    let x = 0;
                    let y = 0;

                    if (buttonHeightValue <= 32) {
                        iconSize = 16;
                    } else if (buttonHeightValue < 56) {
                        iconSize = 24;
                        iconPaddingH = 16;
                    } else if (buttonHeightValue >= 56) {
                        iconSize = 32;
                        iconPaddingH = 24;
                    }

                    x = Math.floor((buttonHeightValue - iconSize) / 2);
                    y = x;

                    buttonIcon = createShapePath(
                        buttonArtboard,
                        x,
                        y,
                        iconSize,
                        iconSize,
                        frontColor,
                        "",
                        "Icon"
                    );
                }
            } catch (iconCreationErr) {
                console.log(iconCreationErr);
            }

            // TODO: make the Icon a Symbol or a Symbol Instance
            // if (buttonType === 1 || buttonType === 2) {
            // var symbolsPage = Page.getSymbolsPage(document);
            // if (symbolsPage != null) {
            //     var symbolsPageLayers = symbolsPage.layers;
            //     console.log(symbolsPageLayers);
            //     for (let symbolsIndex = 0; symbolsIndex < symbolsPageLayers.length; symbolsIndex++) {
            //         if ()
            //     }
            // }
            // if () {

            // } else {
            // document.selectedLayers = [];

            // buttonIcon.selected = true;

            // let symbolIcon = createSymbolFromLayer(buttonIcon);

            // document.selectedLayers = [];
            // }
            // }

            // ********************************************** //
            // Manage the text % icon position                //
            // - Automatic padding if Layout 0 (Smart Layout) //
            // - Fized center position if layout 1 (Fixed)    //
            // ********************************************** //
            if (buttonType === 0 || buttonType === 1) {
                if (buttonLayout === 0) {
                    // console.log("button size based on Smart Layout");
                    buttonWidth =
                        buttonText.frame.width +
                        2 * buttonPaddingHorizontalValue +
                        iconSpace;

                    buttonText.frame.x =
                        buttonPaddingHorizontalValue + iconSpace;
                } else {
                    // console.log("button size based on Fixed Layout");
                    buttonWidth = buttonWidthValue;
                    buttonText.frame.x = Math.floor(
                        (buttonWidthValue -
                            buttonText.frame.width +
                            iconSpace) /
                        2
                    );
                    if (buttonType === 1) {
                        buttonIcon.frame.x = Math.floor(
                            (buttonWidthValue -
                                buttonText.frame.width -
                                iconSpace) /
                            2
                        );
                    }
                }
            } else {
                // Button icon only
                buttonWidth = buttonWidthValue;
            }
            buttonArtboard.frame.width = buttonWidth;

            /* Create a Content group for text & icon */
            if (buttonType === 0) {
                buttonContent = createGroup(
                    buttonArtboard, [buttonText],
                    "Content"
                );
            } else if (buttonType === 1) {
                buttonContent = createGroup(
                    buttonArtboard, [buttonIcon, buttonText],
                    "Content"
                );
            } else {
                buttonContent = createGroup(
                    buttonArtboard, [buttonIcon],
                    "Content"
                );
            }

            buttonContent.adjustToFit();

            /* set the Content group constraint option */
            setResizingConstraint(
                buttonContent, [false, false, false, false], [true, false]
            );

            /* Set the Button background (set the obj buttonBackground)*/
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

                createNewLayerStyle(buttonBackground, buttonName, true, true);
            }

            /* Create the Button hotspot */
            buttonHotspot = createHotspot(
                buttonArtboard,
                buttonWidth,
                buttonHeightValue,
                "Prototype"
            );

            delete buttonHotspot.flow.target;
            buttonHotspot.flow.targetId = "";

            buttonHotspot.moveToBack();

            /* Generate the Source Symbol */
            let sourceSymbol = SymbolMaster.fromArtboard(buttonArtboard);

            /* Set the symbol's Smart Layout options (Assumption: they're always centered) */
            if (buttonLayout === 0) {
                setSmartLayout(sourceSymbol, "horizontallyCenter");
            }

            /* Manage the symbol's overrides (background and styles are not overridable) */
            lockSymbolOverrides(sourceSymbol, overrideOptionsToLock);

            sourceSymbol.selected = true;

            /* Unselect any previously selected item in the canvas */
            document.selectedLayers = [];

            /* Create the symbol's states variants */
            createSymbolVariants(sourceSymbol);

            sourceSymbol.selected = true;

            document.centerOnLayer(sourceSymbol);
            doc.setZoomValue(75 / 100);

            browserWindow.close();
        } catch (pluginErr) {
            console.log(pluginErr);
        }
    });

    browserWindow.loadURL(require("../resources/webview.html"));
}

// ******************************************************************* //
// Items management support functions                                  //
// ******************************************************************* //

/* Manage the background */
function backgroundNoStyle(
    parentLayer,
    x,
    y,
    width,
    height,
    color,
    cornerRadius
) {
    let xPosition = x;
    let yPosition = y;
    let backgroundWidth = width;
    let backgroundHeight = height;
    let backgroundColor = "#" + color;
    let backgroundBorder = "";
    let backgroundCornerRadius = cornerRadius;

    buttonBackground = createShapePath(
        parentLayer,
        xPosition,
        yPosition,
        backgroundWidth,
        backgroundHeight,
        backgroundColor,
        backgroundBorder,
        buttonBackgroundName
    );

    buttonBackground.points.forEach(
        (point) => (point.cornerRadius = backgroundCornerRadius)
    );
    buttonBackground.sketchObject.setFixedRadius(backgroundCornerRadius);

    buttonBackground.moveToBack();
}

function backgroundWithStyle(
    parentLayer,
    x,
    y,
    width,
    height,
    styleID,
    cornerRadius
) {
    let xPosition = x;
    let yPosition = y;
    let backgroundWidth = width;
    let backgroundHeight = height;
    let backgroundColor = "#ffffff";
    let backgroundBorder = "";
    let backgroundStyleID = styleID;
    let backgroundCornerRadius = cornerRadius;

    let index = arrayLayerStyleIDs.indexOf(backgroundStyleID);

    buttonBackground = createShapePath(
        parentLayer,
        xPosition,
        yPosition,
        backgroundWidth,
        backgroundHeight,
        backgroundColor,
        backgroundBorder,
        buttonBackgroundName
    );

    buttonBackground.sharedStyleId = backgroundStyleID;
    buttonBackground.style = layerStyles[index].style;
    buttonBackground.points.forEach(
        (point) => (point.cornerRadius = backgroundCornerRadius)
    );
    buttonBackground.sketchObject.setFixedRadius(backgroundCornerRadius);

    buttonBackground.moveToBack();
}

/* Manage the text */
function createTextNoStyle(
    parentLayer,
    padding,
    backgroundColor,
    align,
    fontSize,
    lineHeight
) {
    try {
        let textX = padding;
        let textY = 10;
        let textParent = parentLayer;
        let textColor = colorContrast(backgroundColor);
        let textFontFamily = "Open Sans";
        let textFontWeight = 5;
        let textValue = buttonTextName;
        let textName = buttonTextName;
        let textAlign = align;

        let newText = new Text({
            parent: textParent,
            text: textValue,
        });

        newText.frame.x = textX;
        newText.frame.y = textY;
        newText.style.textColor = textColor;
        newText.style.fontSize = fontSize;
        newText.style.lineHeight = lineHeight;
        newText.style.alignment = textAlign;
        newText.style.fontFamily = textFontFamily;
        newText.style.fontWeight = textFontWeight;

        newText.name = textName;

        return newText;
    } catch (textNoStyleErr) {
        console.log(textNoStyleErr);
    }
}

function createTextWithStyle(parentLayer, padding, styleID) {
    let textX = padding;
    let textY = 10;
    let textParent = parentLayer;
    let textStyleID = styleID;
    let textValue = buttonTextName;
    let textName = buttonTextName;

    let index = arrayTextStyleIDs.indexOf(textStyleID);

    let newText = new Text({
        parent: textParent,
        text: textValue,
    });

    newText.frame.x = textX;
    newText.frame.y = textY;
    newText.sharedStyleId = textStyleID;
    newText.style = textStyles[index].style;
    newText.name = textName;

    return newText;
}

// ******************************************************************* //
// Handle function to manage Sketch items                              //
// ******************************************************************* //

function createHotspot(parentLayer, width, height, name) {
    try {
        let HotSpot = sketch.HotSpot;
        let newHotspot = new HotSpot({
            parent: parentLayer,
            name: name,
            frame: {
                x: 0,
                y: 0,
                width: width,
                height: height,
            },
            flow: {
                target: Flow.BackTarget,
                animationType: Flow.AnimationType.none,
            },
        });

        return newHotspot;
    } catch (errHotspot) {
        console.log(errHotspot);
    }
}

function createArtboard(parentLayer, x, y, width, height, name) {
    let Artboard = sketch.Artboard;
    let artboard = new Artboard({
        name: name,
        parent: parentLayer,
        frame: {
            x: x,
            y: y,
            width: width,
            height: height,
        },
    });

    return artboard;
}

function createShapePath(
    parentLayer,
    x,
    y,
    width,
    height,
    background,
    border,
    name
) {
    let borders = [];
    if (border !== "") {
        borders = border;
    }
    let ShapePath = sketch.ShapePath;
    let newShape = new ShapePath({
        parent: parentLayer,
        frame: {
            x: x,
            y: y,
            width: width,
            height: height,
        },
        style: { fills: [background], borders: borders },
        name: name,
    });

    return newShape;
}

function createGroup(parentLayer, children, name) {
    try {
        let Group = sketch.Group;
        let newGroup = new Group({
            parent: parentLayer,
            layers: children,
            name: name,
        });

        // setResizingConstraint(newGroup, false, false, false, false, true, false);

        return newGroup;
    } catch (errGroup) {
        console.log(errGroup);
    }
}

/* Smart Layout and pinProperties Options */
function setResizingConstraint(
    item,
    pinProperties = [false, false, false, false],
    sizeProperties = [false, false]
) {
    // var layerResizingConstraint = item.sketchObject.resizingConstraint();

    let flagMap = ["1", "1", "1", "1", "1", "1"];

    let leftPin = pinProperties[0];
    if (leftPin === true) {
        flagMap[3] = "0";
    }
    let rightPin = pinProperties[1];
    if (rightPin === true) {
        flagMap[5] = "0";
    }
    let topPin = pinProperties[2];
    if (topPin === true) {
        flagMap[0] = "0";
    }
    let bottomPin = pinProperties[3];
    if (bottomPin === true) {
        flagMap[2] = "0";
    }

    let fixedWidth = sizeProperties[0];
    if (fixedWidth === true) {
        flagMap[4] = "0";
    }
    let fixedHeight = sizeProperties[1];
    if (fixedHeight === true) {
        flagMap[1] = "0";
    }

    let result =
        flagMap[0] +
        flagMap[1] +
        flagMap[2] +
        flagMap[3] +
        flagMap[4] +
        flagMap[5];

    item.sketchObject.setResizingConstraint(parseInt(result, 2));
}

function setSmartLayout(item, type) {
    let smartLayoutType = type;
    switch (smartLayoutType) {
        case "LeftToRight":
            return (item.smartLayout = SmartLayout.LeftToRight);
        case "horizontallyCenter":
            return (item.smartLayout = SmartLayout.HorizontallyCenter);
        case "RightToLeft":
            return (item.smartLayout = SmartLayout.RightToLeft);
        case "TopToBottom":
            return (item.smartLayout = SmartLayout.TopToBottom);
        case "VerticallyCenter":
            return (item.smartLayout = SmartLayout.VerticallyCenter);
        case "BottomToTop":
            return (item.smartLayout = SmartLayout.BottomToTop);
    }
}

/* Check child name */
function getNamedChildLayer(parentLayer, name) {
    let newLayer = null;

    parentLayer.layers.forEach(function(item) {
        if (item.name === name) {
            newLayer = item;
        }
    });

    return newLayer;
}

// ******************************************************************* //
// General Styles management functions                                 //
// ******************************************************************* //

function getLayerStyleNameFromID(id) {
    let styleName = "";
    for (let i = 0; i < arrayLayerStyleNames.length; i++) {
        if (arrayLayerStyleIDs[i] === id) {
            styleName = arrayLayerStyleNames[i];
        }
    }
    return styleName;
}

function getTextStyleNameFromID(id) {
    try {
        let textStyle = "";
        for (let i = 0; i < arrayTextStyleStyles.length; i++) {
            if (arrayTextStyleIDs[i] === id) {
                textStyle = arrayTextStyleStyles[i];
            }
        }
        return textStyle;
    } catch (getTextStylesStyleFromIDErr) {
        console.log(getTextStylesStyleFromIDErr);
    }
}

function getLayerStyleIDFromName(name) {
    let styleID = "";
    for (let i = 0; i < arrayLayerStyleIDs.length; i++) {
        if (arrayLayerStyleNames[i] === name) {
            styleID = arrayLayerStyleIDs[i];
        }
    }
    return styleID;
}

function getTextStyleIDFromName(name) {
    let styleID = "";
    for (let i = 0; i < arrayTextStyleIDs.length; i++) {
        if (arrayTextStyleNames[i] === name) {
            styleID = arrayTextStyleIDs[i];
        }
    }
    return styleID;
}

function createNewLayerStyle(item, styleName, apply = false, variants = false) {
    // let document = sketch.getSelectedDocument();
    try {
        if (arrayLayerStyleNames.indexOf(styleName) === -1) {
            let sharedStyle = layerStyles.push({
                name: styleName,
                style: item.style,
                document: document,
            });
            updateLayerStyles();
            if (apply === true) {
                let newLayerStyleID = getLayerStyleIDFromName(styleName);
                let localIndex = arrayLayerStyleIDs.indexOf(newLayerStyleID);
                item.sharedStyleId = newLayerStyleID;
                item.style = layerStyles[localIndex].style;
            }
            if (variants === true && states.length > 0) {
                styleName = styleName.replace(states[0], "");
                for (let vIndex = 1; vIndex < states.length; vIndex++) {
                    styleName =
                        styleName.replace(states[vIndex - 1], "") +
                        states[vIndex];
                    sharedStyle = layerStyles.push({
                        name: styleName,
                        style: item.style,
                        document: document,
                    });
                }
            }
            return sharedStyle;
        } else {
            if (apply === true) {
                let newLayerStyleID = getLayerStyleIDFromName(styleName);
                let localIndex = arrayLayerStyleIDs.indexOf(newLayerStyleID);
                item.sharedStyleId = newLayerStyleID;
                item.style = layerStyles[localIndex].style;
            }
        }
    } catch (createLayerStyleErr) {
        console.log(createLayerStyleErr);
    }
}

function createNewTextStyle(item, styleName, apply = false, variants = false) {
    // let document = sketch.getSelectedDocument();
    try {
        if (arrayTextStyleNames.indexOf(styleName) === -1) {
            let sharedStyle = textStyles.push({
                name: styleName,
                style: item.style,
                document: document,
            });
            updateTextStyles();
            if (apply === true) {
                let newTextStyleID = getTextStyleIDFromName(styleName);
                let localIndex = arrayTextStyleIDs.indexOf(newTextStyleID);
                item.sharedStyleId = newTextStyleID;
                item.style = textStyles[localIndex].style;
            }
            if (variants === true && states.length > 0) {
                styleName = styleName.replace(states[0], "");
                for (let vIndex = 1; vIndex < states.length; vIndex++) {
                    styleName =
                        styleName.replace(states[vIndex - 1], "") +
                        states[vIndex];
                    sharedStyle = textStyles.push({
                        name: styleName,
                        style: item.style,
                        document: document,
                    });
                }
            }
            // return sharedStyle;
        } else {
            if (apply === true) {
                let newTextStyleID = getTextStyleIDFromName(styleName);
                let localIndex = arrayTextStyleIDs.indexOf(newTextStyleID);
                item.sharedStyleId = newTextStyleID;
                item.style = textStyles[localIndex].style;
            }
        }
    } catch (createTextStyleErr) {
        console.log(createTextStyleErr);
    }
}

function updateLayerStyles() {
    layerStyles = document.sharedLayerStyles;
    arrayLayerStyleIDs = layerStyles.map((sharedstyle) => sharedstyle["id"]);
    arrayLayerStyleNames = layerStyles.map(
        (sharedstyle) => sharedstyle["name"]
    );
    arrayLayerStyleStyles = layerStyles.map(
        (sharedstyle) => sharedstyle["style"]
    );
}

function updateTextStyles() {
    let textStyles = document.sharedTextStyles;
    arrayTextStyleIDs = textStyles.map((sharedstyle) => sharedstyle["id"]);
    arrayTextStyleNames = textStyles.map((sharedstyle) => sharedstyle["name"]);
    arrayTextStyleStyles = textStyles.map(
        (sharedstyle) => sharedstyle["style"]
    );
}

// ******************************************************************* //
// Symbols Management                                                  //
// ******************************************************************* //
function setSymbolsInPage() {
    symbolsCounter();

    if (symbolCounter > 0) {
        let lastSymbol = page.layers.slice(-1)[0];

        let lastSymbolY = lastSymbol.frame.y;
        let lastSymbolH = lastSymbol.frame.width;
        let lastSymbolX = lastSymbol.frame.x;
        let lastSymbolW = lastSymbol.frame.width;
        // symbols name should not count all the generates button type states
        // count the first created button as variant 01
        let symbolTypeCount = symbolCounter / states.length + 1;
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
        buttonName = symbolName + symbolIndex + symbolStatus;
    }
}

function createSymbolFromLayer(item) {
    try {
        let iconName = item.name;
        let selectedLayersObject = document.selectedLayers;
        let selectedLayersArray = selectedLayersObject.layers;

        let interalLayersArray = selectedLayersArray.map(
            (layer) => layer.sketchObject
        );

        let msLayerArray = MSLayerArray.arrayWithLayers(interalLayersArray);
        // console.log(msLayerArray);
        MSSymbolCreator.createSymbolFromLayers_withName_onSymbolsPage(
            msLayerArray,
            iconName,
            true
        );
    } catch (errIconSymbol) {
        console.log(errIconSymbol);
    }
}

function createSymbolVariants(sourceSymbol) {
    updateLayerStyles();

    let symbol = sourceSymbol;
    let symbolCurrentName = symbol.name;
    let symbolCurrentX = symbol.frame.x;
    let symbolCurrentWidth = symbol.frame.width;

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

    for (let s = 1; s < states.length; s++) {
        let symbolBaseName = symbolCurrentName;
        if (symbolCurrentName.includes(states[0])) {
            symbolBaseName = symbolCurrentName.replace(states[0], "");
        }

        // console.log(symbolBaseName);

        let newStatusSuffix = states[s];

        let newState = symbol.duplicate();
        let newStateName = symbolBaseName + newStatusSuffix;
        newState.name = newStateName;

        newState.frame.x = symbolCurrentX + symbolCurrentWidth + 40;
        symbolCurrentX = newState.frame.x;

        // Apply a Text style for each variant
        // let internalText = getNamedChildLayer(newState, buttonTextName);

        // internalText.selected = true;
        // document.selectedLayers = [];

        // Apply a Layer style for each variant
        let internalBackground = getNamedChildLayer(
            newState,
            buttonBackgroundName
        );

        internalBackground.selected = true;

        let layerStatesStylesLength = layerStatesStyles.length;

        if (layerStatesStylesLength > 0) {
            let currentBackgroundStyleName = getLayerStyleNameFromID(
                internalBackground.sharedStyleId
            );
            let currentBackgroundStyleFolders = currentBackgroundStyleName.split(
                "/"
            )[0];
            let currentBackgroundStyleType = currentBackgroundStyleName
                .split("/")
                .pop()
                .replace(states[0], newStatusSuffix);

            let newBackgroundStyleName =
                currentBackgroundStyleFolders +
                "/" +
                currentBackgroundStyleType;

            let newLayerStyleID = getLayerStyleIDFromName(
                newBackgroundStyleName
            );
            if (newLayerStyleID !== "") {
                let localIndex = arrayLayerStyleIDs.indexOf(newLayerStyleID);
                internalBackground.sharedStyleId = newLayerStyleID;
                internalBackground.style = layerStyles[localIndex].style;
            }
        }

        newState.index = symbol.index - s + 1;

        document.selectedLayers = [];
    }
}

function lockSymbolOverrides(item, options) {
    for (let index = 0; index < item.overrides.length; index++) {
        let property = item.overrides[index].property;
        for (
            let optionsIndex = 0; optionsIndex < options.length; optionsIndex++
        ) {
            if (property === options[optionsIndex]) {
                item.overrides[index].editable = false;
            }
        }
    }
}

function symbolsCounter() {
    var currentPage = doc.currentPage();
    var listOfSymbols = currentPage.symbols();

    symbolCounter = listOfSymbols.count();
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
    return result ?
        {
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
    const [page] = document.pages.filter((page) => page.name === name);

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

// ******************************************************************* //
// When the plugin is shutdown by Sketch (for example when the user    //
// disable the plugin) we need to close the webview if it's open       //
// ******************************************************************* //
export function onShutdown() {
    const existingWebview = getWebview(webviewIdentifier);
    if (existingWebview) {
        existingWebview.close();
    }
}