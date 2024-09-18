async function send_captcha(captcha, solution=null, attempt=0) {
    if(attempt == 5) {
      return;
    }
    try {
        const url = "https://6bot.chaueq.com/api/ml/" + (solution === null ? 'unsolved' : 'solved');
        const response = await fetch(url, {
        method: "POST",
        headers: {
          'Accept': '*',
          'Content-Type': 'text/csv',
          'X-Apikey': 'MmIg9955biUMkGnlEyVL5h3aqHhWBy3Ndu9l2S7FQPIfZh07H6TqGdEN87bFdK3c'
        },
        body: (solution === null ? captcha : (captcha + '|' + solution))
      });
      if(!response.ok) {
        console.log(response);
      }
    }
    catch (e) {
      await sleep(1000);
      await send_captcha(captcha, solution, attempt+1);
    }
}

async function commitCaptchaFindings() {
  if((await getSettings()).captcha.feed_ml) {
    const history = getCaptchaHistory();
    if(history.length == 0) {
      return;
    }
    const solution = history[history.length-1];
    const captcha = document.getElementById('last_captcha').value;
    const known = document.getElementById('known_captchas').value.split('|').filter((x) => x.length > 0);
    for(c of known) {
        if(c == captcha) {
            send_captcha(c, solution);
        }
        else {
            send_captcha(c);
        }
    }
  }
  
  const to_reset = [document.getElementById('known_captchas'), document.getElementById('last_captcha')];
  for(const obj of to_reset) {
      if(obj != null && obj != undefined)
          obj.value = '';
  }
}