function isSPAM(msg) {
  const spam_phrases = [
    'kto pyta',
    'trans',
    'helikopter bojowy',
    'kebab',
    'xxi',
    'pedofil'
  ];
  const spam_usernames = [
    'weroxsr',
    'majciatjs',
    'werkisia',
    'haniaxspo',
    'werkaxsr',
    'weroxsc',
    'wexayu',
    'hrkasiunq',
    'hbkasiunq',
    'haniaxlw',
    'marveska',
    'xvxamelka_',
    'hanila08',
    'majkawpz',
    'nicolysdf',
    'haniaxpw',
    'tosianof',
    'werkaxtop',
    'werkaxpe',
    'tosiaf',
    'hyrulcia',
    'werkaxkra',
    'saaraazzka'
  ];
  const spam_regexes = [
    'sprzedaj[eę]',
    'odp[łl]atnie',
    '(szukam)? ?(par(y|ki))',
    '\\d+ ?z[lł]',
    'jakis gosciu bzyka mi mamu[sś]ke',
    'g[oóu](wn|nw)o',
    '(werka|hania)x[a-z]+',
    'kasiao[a-z]+'
  ];

  for(const test of spam_phrases) {
    if(SPAM_phrase(test, msg)) {
      return true;
    }
  }
  for(const test of spam_usernames) {
    if(SPAM_username(test, msg)) {
      return true;
    }
  }
  for(const test of spam_regexes) {
    if(SPAM_regex(test, msg)) {
      return true;
    }
  }
  return false;
}

function SPAM_phrase(phrase, msg) {
  return msg.includes(phrase);
}

function SPAM_username(username, msg) {
  const separators_pattern = '[^a-z0-9?]*';
  let pattern = '(^|' + separators_pattern + ')';
  for(let i=0; i < username.length; ++i) {
    if(i == username.length-1) {
      pattern += username[i] + '($|' + separators_pattern + ')';
    }
    else {
      pattern += username[i] + separators_pattern;
    }
  }
  return SPAM_regex(pattern, msg);
}

function SPAM_regex(regex, msg) {
  const rex = new RegExp(regex, 'g');
  return rex.test(msg);
}