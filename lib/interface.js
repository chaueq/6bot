async function sendMessage(text, prefs, obcy) {
  const reaction = sleep(prefs.convo.reaction_time);
  const lastMsg = getLastMessage();
  const txtarea = document.getElementById('box-interface-input');
  const sendbtn = document.querySelector('button.o-send');

  if(lastMsg !== undefined) {
    if(!lastMsg.received && lastMsg.value == text) {
      return;
    }
  }

  text = translateMsg(text, prefs.user, obcy);

  if(/^ *$/.test(text)) {
    return;
  }

  await reaction;

  if(prefs.convo.typing_delay > 0) {
    for(let i = 1; i <= text.length; ++i) {
      if(convoEnded())
        return;
      txtarea.value = text.substring(0, i);
      await sleep(prefs.convo.typing_delay);
    }
  }

  if(prefs.convo.disconnect && !obcy.told.bot) {
    text = markBotMessage(text);
    obcy.told.bot = true;
  }
  txtarea.value = text;
  await sleep(prefs.convo.typing_delay);
  if(text.length == 0 || txtarea.value.length == 0) {
    return;
  }
  sendbtn.click();
  await sleep(prefs.convo.typing_delay);

  if(messageDuplicate()) {
    await hitCancelButton();
  }
}

async function hitNextButton() {
  const btn = document.querySelector('button.o-esc');
  if(!btn.classList.contains('disabled')) {
    btn.click();
  }
}

async function hitConfirmButton() {
  const btn = document.querySelectorAll('div.sd-interface.unselectable>button')[1];
  btn.click();
}

async function hitCancelButton() {
  const btn = document.querySelectorAll('div#sd-current>div.sd-unit>div.sd-interface.unselectable>button')[1];
  btn.click();
}