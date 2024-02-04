async function main(addedEL = false) {
  const delay = 200;

  if (captchaAppeared()) {
    if(!(await adVerify())) {
      return;
    }
    if (!addedEL) {
      document.querySelectorAll('div#simple-dialogs>div#sd-current>div.sd-unit>div.sd-interface.unselectable>button')[1].addEventListener('click', (e) => {
        setTimeout(main, 1000, true);
      });
      const limit = (await getSettings()).captcha.tries_limit;
      captcha_cntr = limit == 0 ? Infinity : limit;
      solveCaptcha();
    }
    else if(captchaError() && captcha_cntr > 1) {
      --captcha_cntr;
      changeCaptcha();
    }
    else if(captcha_cntr > 0) {
      --captcha_cntr;
      solveCaptcha();
    }
    else {
      playNotif();
    }
    return;
  }
  else if (convoStarted()) {
    resetCaptchaHistory();
    const recorder = recordConvo();
    await conversation();
    await recorder;
  }
  else if (convoEnded()) {
    await hitNextButton();
  }

  setTimeout(main, delay, false);
}

let captcha_cntr;
let start = document.createElement('span');
start.innerText = '🤖';
start.style = 'text-align: center; position: absolute; left: 25px; bottom:calc(1em + 25px); font-size: 50px; cursor: pointer; filter: invert(); z-index: 1000;';
start = document.body.appendChild(start);
start.addEventListener('click', async (e) => {
  const settings_correct = await verifySettings();

  if(settings_correct) {
    e.target.parentNode.removeChild(e.target);
    tipsyRemove();
    createObcyInfoBox();
    captchaInputWatcher();
    main();
    setInterval(timeCounter, 60000);
  }
  else {
    window.alert('Twoje ustawienia 6bot są nieprawidłowe!\nPopraw je aby używać 6bota.')
  }
});

metricsOnOpen();
uxOnOpen();
removeAds();
adMain();