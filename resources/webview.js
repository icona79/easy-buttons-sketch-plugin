// disable the context menu (eg. the right click menu) to have a more native feel
document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
})

// call the plugin from the webview
// document.getElementById('button').addEventListener('click', () => {
//   window.postMessage('nativeLog', 'Called from the webview')
// })

// ************************************************** //
// Validate the input fields                          //
// ************************************************** //
const numbersOnly = /^\d+$/;
const decimalOnly = /^\s*-?[1-9]\d*(\.\d{1,2})?\s*$/;
const uppercaseOnly = /^[A-Z]+$/;
const lowercaseOnly = /^[a-z]+$/;
const stringOnly = /^[A-Za-z0-9]+$/;

var buttonType = 0;
var buttonType1 = document.getElementById("buttonType1");
var buttonPaddingHorizontalID = document.getElementById("buttonWidth");
var buttonHeightID = document.getElementById("buttonHeight");
var cornerRadiusID = document.getElementById("cornerRadius");
var cornerRadiusValueID = document.getElementById("cornerRadiusValue");
var backgroundColorValueID = document.getElementById("backgroundColorValue");

document.getElementById("parametersSubmit").addEventListener("click", () => {
    var buttonTypeRadios = document.getElementsByName("buttonType");
    for (i = 0; i < buttonTypeRadios.length; i++) {
        if (buttonTypeRadios[i].checked) {
            buttonType = i;
        }
    }

    var buttonPaddingHorizontalValue = 16;
    if (buttonPaddingHorizontalID.value != "") {
        buttonPaddingHorizontalValue = buttonPaddingHorizontalID.value;
    }
    var buttonHeightValue = 40;
    if (buttonHeightID.value != "") {
        buttonHeightValue = buttonHeightID.value;
    }
    var cornerRadiusSelection = cornerRadiusID.value;
    var cornerRadiusValue = 0;
    if (cornerRadiusSelection === "3") {
        if (cornerRadiusValueID.value != "") {
            cornerRadiusValue = cornerRadiusValueID.value;
        } else {
            cornerRadiusValue = 4;
        }
    } else if (cornerRadiusSelection === "2") {
        cornerRadiusValue = buttonHeightID.value / 2;
    }
    var backgroundColorValue = "ffffff"
    if (backgroundColorValueID.value != "") {
        backgroundColorValue = backgroundColorValueID.value;
    }
    var parameters = {
        buttonType: buttonType,
        buttonPaddingHorizontalValue: buttonPaddingHorizontalValue,
        buttonHeightValue: buttonHeightValue,
        cornerRadiusSelection: cornerRadiusSelection,
        cornerRadiusValue: cornerRadiusValue,
        backgroundColorValue: backgroundColorValue,
    };

    window.postMessage('nativeLog', parameters);
})

// ************************************************** //
// Expose the value input for corner radius if needed //
// ************************************************** //
cornerRadiusID.addEventListener("change", function() {
    if (cornerRadiusID.value === "3") {
        document
            .getElementById("cornerRadiusValue").disabled = false;
    } else {
        document
            .getElementById("cornerRadiusValue").disabled = true;
    }
});