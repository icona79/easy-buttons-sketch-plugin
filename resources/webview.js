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

var buttonWidthID = document.getElementById("buttonWidth");
var buttonHeightID = document.getElementById("buttonHeight");
var cornerRadiusID = document.getElementById("cornerRadius");
var cornerRadiusValueID = document.getElementById("cornerRadius");

document.getElementById("parametersSubmit").addEventListener("click", () => {
    var buttonWidthValue = buttonWidthID.value;
    var buttonHeightValue = buttonHeightID.value;
    var cornerRadiusSelection = cornerRadiusID.value;
    var cornerRadiusValue = 1;
    if (cornerRadiusSelection === "3") {
        cornerRadiusValue = cornerRadiusValueID.value;
    } else if (cornerRadiusSelection === "2") {
        cornerRadiusValue = buttonHeightID.value / 2;
    }

    var parameters = {
        buttonWidth: buttonWidthValue,
        buttonHeight: buttonHeightValue,
        cornerRadiusSelection: cornerRadiusSelection,
        cornerRadiusValue: cornerRadiusValue,
    };

    window.postMessage('nativeLog', parameters);
})

// call the webview from the plugin
// import { f1 } from "../src/my-command.js";
// f1();
// console.log("here");
// document.getElementById("pluginName").innerHTML = title;

// import { hello } from './../src/my-command.js';
// alert(hello());

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