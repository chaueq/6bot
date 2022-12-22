async function captchaInputWatcher(init=true) {
    const txt = document.querySelector('input.caper-solution-input[type="text"]');

    if(txt === null) {
        return false;
    }

    if(init) {
        txt.value = '';
        txt.focus();
    }

    if(txt.value.length == 7) {
        hitConfirmButton();
        while(!(await captchaInputWatcher())) {
            await sleep(100);
        }
    }
    else {
        setTimeout(captchaInputWatcher, 100, false);
    }

    return true;
}