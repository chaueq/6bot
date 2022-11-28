async function captchaInputWatcher(init=true) {
    const txt = document.querySelector('input.caper-solution-input[type="text"]');

    if(init) {
        txt.value = '';
        txt.focus();
    }

    if(txt.value.length == 7) {
        hitConfirmButton();
    }
    else {
        setTimeout(captchaInputWatcher, 100, false);
    }
}