async function main(addedEL = false) {
  const delay = 200;

  if (captchaAppeared()) {
    if(!(await adVerify())) {
      return;
    }
    if(captchaError() || !addedEL) {
      (async () => {
        while(!(await captchaInputWatcher(true)))
          await sleep(100);
      })();
    }
    if (!addedEL) {
      document.querySelectorAll('div.sd-interface>button')[1].addEventListener('click', (e) => {
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
  } else if (convoStarted()) {
    resetCaptchaHistory();
    await conversation();
  } else if (convoEnded()) {
    await hitNextButton();
  }

  setTimeout(main, delay, false);
}

let captcha_cntr;
let start = document.createElement('span');
start.innerText = '🤖';
start.style = 'text-align: center; position: absolute; left: 25px; bottom:25px; font-size: 50px; cursor: pointer; filter: invert(); z-index: 1000;';
start = document.body.appendChild(start);
start.addEventListener('click', (e) => {
  e.target.parentNode.removeChild(e.target);
  tipsyRemove();
  createObcyInfoBox();
  main();
});

removeAds();
adMain();