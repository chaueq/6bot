function isSPAM(msg) {
  const spam_phrases = [
    'kto pyta',
    'helikopter bojowy',
    'kebab',
    'xxi',
    'pedofil',
    'blik'
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
    'tosianov',
    'werkaxtop',
    'werkaxpe',
    'tosiaf',
    'hyrulcia',
    'werkaxkra',
    'saaraazzka',
    'c51kaja',
    'ckasiamb',
    'penylcia',
    'majva25',
    'moooniv',
    'nicolytxt',
    'nosamantka',
    'majkapcj',
    'porulcia',
    'klaudex5',
    'c37kaja',
    'c53kaja',
    'c36kaja',
    'oliweczkatv',
    'ckasiau',
    'werabernas',
    'wiki_kr',
    'aaniax',
    'zosiatv',
    'agatajdk',
    'fakylcia',
    'majlba35',
    'oluskatv',
    'xwerkasy',
    'wkasiac',
    'wkasiam',
    'wkasiad',
    'nicolyotl',
    'zhaniahf',
    'majaotq',
    'werkakalwas',
    'kasiaobn',
    'werkaxtc',
    'majacpj',
    'majkahsp',
    'zhaniaxms',
    'werkaxyp',
    'maajacxd',
    'hanila62',
    'werkaztr',
    'kasiaofr',
    'majvla51',
    'haniamazur19',
    'haniaxkf',
    'zhaniaxss',
    'majkapzd',
    'majasdl',
    'majkapvf',
    'majkapch',
    'taxwerkaz',
    'majkahsa',
    'majkagpa',
    'majlva531',
    'majaabw',
    'werkaxks',
    'werkajwk',
    'majkaghz',
    'majvla45',
    'werakalwas',
    'werkahodyl',
    'majatpn',
    'majlva40',
    'liwkakalwas',
    'liwiakalwas',
    'liwciakalwas',
    'advsiaxxx',
    'basiatv',
    'monisiatv',
    'majaugg',
    'sarajozwik',
    'weraxsr',
    'zhaniahm',
    'c56kaja',
    'kasiatv',
    'zhaniapm',
    'werkaxyb',
    'zhaniapv',
    'werkaxgp',
    'nicolyjkd',
    'weraxse',
    'vanitkavv',
    'c37darciaa',
    'c72darciaa',
    'c89darciaa',
    'c13darciaa',
    'c82darciaa',
    'c31darciaa'
  ];
  const spam_regexes = [
    'sprz[e3]da?(j[eę]|m)',
    'odp[łl]atnie',
    '(szukam)? ?(par(y|ki))($|[^\\w])',
    '\\d+ ?z[lł]',
    'jakis gosciu bzyka mi mamu[sś]ke',
    'g[oóu](wn|nw)o',
    '(werka|hania)[a-z]+',
    '[a-z]*xwerka[a-z]+',
    'kasiao[a-z]+',
    'nicoly[a-z]{3}',
    'ma+jk?a[a-z]{3}',
    'c\\d\\dkaja',
    '(^|[^\\w])trans($|[^\\w])',
    '\\w+tv',
    'c\\d\\ddarciaa'
  ];

  for(const test of [...spam_phrases, ...spam_usernames]) {
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
  for(const test of [...spam_phrases, ...spam_usernames]) {
    if(SPAM_heuristic(test, msg)) {
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

function SPAM_heuristic(word, msg, sensivity=0.8) {
  return (strcmp(word, msg) > sensivity);
}