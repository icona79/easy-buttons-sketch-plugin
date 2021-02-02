// disable the context menu (eg. the right click menu) to have a more native feel
document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
})

// call the plugin from the webview
// document.getElementById('button').addEventListener('click', () => {
//   window.postMessage('nativeLog', 'Called from the webview')
// })

document.getElementById('parametersSubmit').addEventListener('click', () => {
    const inputText = document.getElementById('inputText').value;

    const dropdownValue = document.getElementById("dropdown").value;

    var parameters = {
        inputText: inputText,
        dropdownValue: dropdownValue,
    };

    window.postMessage('nativeLog', parameters);
})

// call the webview from the plugin
// window.setRandomNumber = (randomNumber) => {
//   document.getElementById('answer').innerHTML = 'Random number from the plugin: ' + randomNumber
// }