function captchaError() {
    try {
        return document.querySelector('div.caper-wrong-field').checkVisibility();
    } catch(e) {return false}
}