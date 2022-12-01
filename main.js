async function main(addedEL = false) {
  let delay = 200;

  if (captchaAppeared()) {
    if(captchaError() || !addedEL) {
      (async () => {
        while(!(await captchaInputWatcher(true)))
        console.log('trying')
          await sleep(100);
      })();
    }
    if (!addedEL) {
      document.querySelectorAll('div.sd-interface>button')[1].addEventListener('click', (e) => {
        setTimeout(main, 1000, true, true);
      });
      solveCaptcha();
    }
    else {
      playNotif();
    }
    return;
  } else if (convoStarted()) {
    await conversation();
  } else if (convoEnded()) {
    await hitNextButton();
  }

  setTimeout(main, delay, false);
}

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