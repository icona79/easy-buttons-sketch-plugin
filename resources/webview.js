// disable the context menu (eg. the right click menu) to have a more native feel
// document.addEventListener('contextmenu', (e) => {
//     e.preventDefault();
// })

// call the plugin from the webview
// document.getElementById('button').addEventListener('click', () => {
//     window.postMessage('nativeLog', 'Called from the webview')
// })

// Enter Key = Click on Create Button button
document.addEventListener("keyup", function(event) {
    if (event.keyCode === 13) {
        document.getElementById("parametersSubmit").click();
    }
});

// ************************************************** //
// Validate the input fields                          //
// ************************************************** //
const numbersOnly = "/^\d+$/";
const decimalOnly = "/^\s*-?[1-9]\d*(\.\d{1,2})?\s*$/";
const uppercaseOnly = "/^[A-Z]+$/";
const lowercaseOnly = "/^[a-z]+$/";
const stringOnly = "/^[A-Za-z0-9]+$/";

// Type
var buttonType = 0;
var buttonType1 = document.getElementById("buttonType1");
// Layout
var buttonLayout = 0;
var buttonPaddingHorizontalID = document.getElementById("buttonWidth");
var buttonHeightID = document.getElementById("buttonHeight");
var cornerRadiusID = document.getElementById("cornerRadius");
var cornerRadiusValueID = document.getElementById("cornerRadiusValue");
// Styles
var buttonStyle = 0;
var backgroundColorValueID = document.getElementById("backgroundColorValue");
var backgroundStyleID = document.getElementById("backgroundStyleValue");
var textStyleID = document.getElementById("textStyleValue");

document.getElementById("parametersSubmit").addEventListener("click", () => {
    // Button Type
    var buttonTypeRadios = document.getElementsByName("buttonType");
    for (i = 0; i < buttonTypeRadios.length; i++) {
        if (buttonTypeRadios[i].checked) {
            buttonType = i;
        }
    }

    // Button Layout
    var buttonLayoutRadios = document.getElementsByName("buttonLayout");
    for (i = 0; i < buttonLayoutRadios.length; i++) {
        if (buttonLayoutRadios[i].checked) {
            buttonLayout = i;
        }
    }

    if (buttonLayout === 0) {
        var buttonPaddingHorizontalValue = 16;
    } else {
        var buttonPaddingHorizontalValue = 96;
    }
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

    // Button Style
    var buttonStyleRadios = document.getElementsByName("buttonStyle");
    for (i = 0; i < buttonStyleRadios.length; i++) {
        if (buttonStyleRadios[i].checked) {
            buttonStyle = i;
        }
    }
    if (buttonStyle === 0) {
        var backgroundStyle = backgroundStyleID.value;
        var textStyle = ""; //textStyleID.value;
    } else {
        var backgroundColorValue = "ffffff";
        if (backgroundColorValueID.value != "") {
            backgroundColorValue = backgroundColorValueID.value;
        }
    }

    var parameters = {
        buttonType: buttonType,
        buttonLayout: buttonLayout,
        buttonPaddingHorizontalValue: buttonPaddingHorizontalValue,
        buttonHeightValue: buttonHeightValue,
        cornerRadiusSelection: cornerRadiusSelection,
        cornerRadiusValue: cornerRadiusValue,
        backgroundStyle: backgroundStyle,
        textStyle: textStyle,
        backgroundColorValue: backgroundColorValue,
    };

    //console.log(parameters);

    window.postMessage("nativeLog", parameters);
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

// ************************************************** //
// Expose the layout management items                 //
// ************************************************** //
if (document.querySelector('input[name="buttonLayout"]')) {
    document.querySelectorAll('input[name="buttonLayout"]').forEach((elem) => {
        elem.addEventListener("change", function(event) {
            var item = event.target.value;
            if (item === "1") {
                document.getElementById("smartLayout").hidden = false;
                document.getElementById("fixedLayout").hidden = true;
            } else {
                document.getElementById("smartLayout").hidden = true;
                document.getElementById("fixedLayout").hidden = false;
            }
        });
    });
}

// ************************************************** //
// Expose the right styles management items           //
// ************************************************** //
if (document.querySelector('input[name="buttonStyle"]')) {
    document.querySelectorAll('input[name="buttonStyle"]').forEach((elem) => {
        elem.addEventListener("change", function(event) {
            var item = event.target.value;
            if (item === "1") {
                document.getElementById("existingStyles").hidden = false;
                document.getElementById("newStyles").hidden = true;
            } else {
                document.getElementById("existingStyles").hidden = true;
                document.getElementById("newStyles").hidden = false;
            }
        });
    });
}

// Function to populate the Styles dropdown
window.fillLayerStylesDropdown = function(stylesArray) {
    console.log(stylesArray);
    // stylesArray.forEach((style) => {
    //     console.log(style.name);
    //     console.log(style.id);
    // });
    let select = document.getElementById("backgroundStyleValue");
    let option;

    for (let i = 0; i < stylesArray.length; i += 1) {
        option = document.createElement("option");
        option.setAttribute("value", stylesArray[i].id);
        option.appendChild(document.createTextNode(stylesArray[i].name));
        select.appendChild(option);
        console.log(option);
    }

    // I will return a message that I'll log on the plugin's side, but you can send back anything you want
    return "Styles loaded successfully";
};