(function() {

document.querySelector('body').addEventListener('click', () => parent.postMessage('bodyClick', '*'));

})();