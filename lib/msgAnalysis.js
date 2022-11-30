function analyzeMessage(msg, obcy) {
  const greetingsRE = /((hej(ka|o)?|cze[sś][cć]|wit[ao]m|elk?(o(szk[ai])?|uwina)|siemk?an?(o|eczko)?|essa)[ ,.!]*)/g;
  const sexRE = /(^|[^a-z])(k(obieta)?|m([eę][zż]czyzna)?){1}(bi)?($|[^a-z])/g;
  const ageRE = /\d+/g;
  const zboRE_T = /(ta+k+|z[b6]+|tro(ch|szk)[ęe]+|oczywi[sś]cie+|pewnie+|yup)/g;
  const zboRE_F = /((ni|nop)e+) ?(z[b6]+)?(yt+)?/g;
  const retroRE = /((r[oó]wnie|te)[zż]|tak ?samo)/g;
  const originalMsg = msg;

  if(greetingsRE.test(msg)) {
    msg = msg.replaceAll(greetingsRE, '');
  }
  msg.replaceAll(/(km|mk)\??/g, '');
  msg.replaceAll('z6', 'zb');

  if(retroRE.test(msg)) {
    const convo = getConvo().reverse();
    for(let i = 0; i < convo.length-1; ++i) {
      if(!convo[i].received)
        continue;
      if(convo[i].value == originalMsg) {
        for(let j = i+1; j < convo.length; ++j) {
          if(convo[j].received)
            continue;
          return analyzeMessage(convo[j].value, obcy);
        }
      }
    }
  }

  if(obcy.sex === undefined) {
    let result = msg.match(sexRE);
    if(result === null)
      result = [];
    for(let i = 0; i < result.length; ++i) {
      if(result[i].includes('m'))
        obcy.sex = true;
      else if(result[i].includes('k'))
        obcy.sex = false;
      else continue;
      break;
    }
  }

  if(obcy.age === undefined) {
    let result = msg.match(ageRE);
    if(result != null)
      obcy.age = parseInt(result[0])
  }

  if(obcy.zb === undefined) {
    obcy.zb = zboRE_T.test(msg) ? true : (zboRE_F.test(msg) && (/z[b6]/g.test(msg) || obcy.asked.zb) ? false : undefined);
  }

  if(/le[zs](bijka)?/g.test(msg)) {
    obcy.sex = false;
  }
  else if(/g(ej|ay)/g.test(msg)) {
    obcy.sex = true;
  }

  if(/(szmat|suczk|uleg[łl])a/g.test(msg)) {
    obcy.sex = false;
    obcy.zb = true;
  }
  else if(/(uleg[łl]y)/g.test(msg)) {
    obcy.sex = true;
    obcy.zb = true;
  }
}