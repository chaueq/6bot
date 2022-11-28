function aads() {
    let ad = document.createElement('iframe');
    ad.setAttribute('data-aa', 2114030);
    ad.setAttribute('src', '//ad.a-ads.com/2114030?size=320x50&background_color=182e44&text_color=eeeeee&title_color=dcb000&title_hover_color=dcb000&link_color=eeeeee&link_hover_color=dcb000');
    ad.setAttribute('style', 'width:320px; height:50px; border:0px; padding:0; overflow:hidden; background-color: transparent;');
    return ad;
}

function insertAd() {
    document.querySelector('div.sd-message').appendChild(aads());
}

function adMain() {
    const delay = 100;
    if(captchaAppeared()) {
        const ad = document.querySelector('iframe[data-aa="2114030"]');
        if(ad == null) {
            insertAd();
        }
    }
    setTimeout(adMain, delay);
}