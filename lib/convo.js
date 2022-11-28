function getConvo() {
  const raw = document.querySelectorAll('p.log-msg');
  const parsed = [];
  for(const msg of raw) {
    const text = msg.innerText.split(':');
    const parsedtxt = text[1].toLowerCase().substring(1, text[1].length);
    if(parsedtxt === null)
      continue;
    parsed.push({
      received: (text[0] === 'Obcy'),
      value: parsedtxt,
      rawValue: text[1].substring(1, text[1].length)
    });
  }
  return parsed;
}

function getLastMessage() {
  const convo = getConvo();
  return convo[convo.length - 1];
}

function getConvoLength() {
  return document.querySelectorAll('p.log-msg').length;
}

function getInboxLength() {
  const t = document.querySelectorAll('span.nick');
  const textObcy = 'Obcy';
  let counter = 0;
  for(const m of t ) {
    counter += m.innerText.includes(textObcy);
  }
  return counter;
}

async function waitForAnswer(time, convoLen=getInboxLength()) {
  let passed = 0;
  while (getInboxLength() === convoLen) {
    await sleep(1000);
    passed++;

    if (passed > time || convoEnded()) {
      return false;
    }
  }
  return true;
}


async function endConvo() {
  if(!convoEnded())
    await hitNextButton();
}