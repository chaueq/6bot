async function conversation() {
  const obcy = {
    sex: undefined, //1 = male, 0 = female
    age: undefined,
    zb: undefined,
    silentCounter: 0,
    asked: {
      sex: false,
      age: false,
      zb: false
    },
    told: {
      sex: false,
      age: false,
      zb: false,
      name: false
    },
    status: {
      passed: true,
      spam: false
    }
  };

  const def_autoFix_idleCounter = 10;
  const autoFix = {
    firstTry: true,
    reanalyzed: false,
    idleCounter: def_autoFix_idleCounter
  }
  const prefs = await getSettings();
  const convo_timeout = sleep(prefs.convo.timeout * 1000);
  updateOIB(obcy);

  //Greeting
  if (prefs.convo.greeting.length > 0) {
    await sendMessage(prefs.convo.greeting, prefs, obcy);
  }

  const minConvoTime = sleep(5000);

  //Wait for answer, if not received end convo
  if (getConvo().length < 2) {
    if (!await waitForAnswer(15, 0)) {
      await endConvo();
      return;
    };
  }

  //gather info
  let lastInbox = 0;
  let lastConvoLen = 0;
  while (!convoEnded() && (await promiseState(convo_timeout)) === 'pending') {
    const convo = getConvo();
    const inbox = getInboxLength();
    const autoFix_reanalyze = (autoFix.idleCounter == 0 && !autoFix.reanalyzed);

    if (lastInbox < inbox || autoFix_reanalyze) {
      //autoFix
      if(!autoFix_reanalyze) {
        autoFix.idleCounter = def_autoFix_idleCounter;
        autoFix.reanalyzed = false;
      } else {
        lastConvoLen = 0;
        lastInboxLen = 0;
        autoFix.reanalyzed = true;
      }

      //analyze answers
      for (let i = lastConvoLen; i < convo.length; i++) {
        if (!convo[i].received) {
          continue;
        }

        if (isSPAM(convo[i].value)) {
          obcy.status.spam = true;
          console.log(convo[i].value + ' was recognized as SPAM');
          break;
        }

        await answerQuestions(convo[i].value, prefs, obcy);
        analyzeMessage(convo[i].value, obcy);

        if(obcy.sex === undefined)
          recognizeName(convo[i].value, obcy);
      }
      updateOIB(obcy);

      obcy.status = testObcy(prefs.search, obcy);
      if (!obcy.status.passed) {
        break;
      }

      // ask question
      if (obcy.sex === undefined && obcy.asked.sex === false) {
        let m = drawRandom(['km?', 'km']);
        await sendMessage(m, prefs, obcy);
        obcy.asked.sex = true;
      } else if (obcy.age === undefined && obcy.asked.age === false) {
        let m = drawRandom(['ile lat?', 'ile masz lat?', 'ile lat', 'wiek', 'lat?', 'lat'])
        await sendMessage(m, prefs, obcy);
        obcy.asked.age = true;
      } else if (obcy.zb === undefined && prefs.user.zb == 1 && obcy.asked.zb === false) {
        let m = drawRandom(['zb?', 'z6?', ('zboczon' + (obcy.sex !== undefined ? (obcy.sex ? 'y' : 'a') : 'y/a' + '?'))]);
        await sendMessage(m, prefs, obcy);
        obcy.asked.zb = true;
      } else if ((obcy.sex !== undefined && (obcy.age !== undefined || obcy.zb !== undefined)) || !autoFix.firstTry) {
        break;
      } else {
        autoFix.firstTry = false;
        obcy.asked.zb = false;
        obcy.asked.age = false;
        obcy.asked.sex = false;
        continue;
      }

      lastInbox = inbox;
      lastConvoLen = convo.length;
      await waitForAnswer(10, inbox);
    }
    else {
      --autoFix.idleCounter;
      if(autoFix.reanalyzed && autoFix.idleCounter == 0) {
        break;
      }
      await sleep(1000);
    }
  }

  if(convoEnded()) {
    return;
  }

  obcy.status = testObcy(prefs.search, obcy);

  if (!obcy.status.passed) {
    let msg = '';
    if (obcy.status.reason === 'too young')
      msg += 'za mało'
    else if (obcy.status.reason === 'too old')
      msg += 'za dużo'
    else if (obcy.status.reason === 'sex')
      msg += 'nie interesuje mnie ta płeć'

    await Promise.all([
      minConvoTime,
      msg.length == 0 ? sleep(100) : sendMessage(msg, prefs, obcy)
    ]);
    await endConvo();
    return;
  }

  if (prefs.convo.final_msg.length > 0) {
    await sendMessage(prefs.convo.final_msg, prefs, obcy);
  }

  await minConvoTime;


  if (prefs.convo.disconnect == 1) {
    await endConvo();
  }

  if (!convoEnded()) {
    playNotif();
  }
}