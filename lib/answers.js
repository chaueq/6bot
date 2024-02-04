async function answerQuestions(msg, prefs, obcy) {
  const answers = [{
      question: /^(km|mk|k czy m|m czy k)/g,
      answer: '$p'
    },
    {
      question: /((ile)? ?lat|(jaki)? ?wiek)/g,
      answer: '$w'
    },
    {
      question: /z[b6](oczon[ya])?\?/g,
      answer: '$z'
    },
    {
      question: /(co|jak) ?(tam|s[lł]ycha[cć])/g,
      answer: drawRandom(['wszystko fajnie', 'dobrze', 'ok', 'fajnie', 'w porządku'])
    },
    {
      question: /(a )?ty/g,
      answer: '$*'
    },
    {
      question: /(jak masz na )?imi[eę]\??/g,
      answer: prefs.user.name.length == 0 ? drawRandom(['nie podaję', 'nie chcę mówić', 'nie podam', 'tajemnica', 'nie musisz wiedzieć']) : '$i'
    }
  ];

  for (a of answers) {
    if (a.question.test(msg))
      await sendMessage(a.answer, prefs, obcy);
  }
}