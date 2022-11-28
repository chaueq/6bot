function timeout(obcy) {
  const treshold = 10;
  const convo = getConvo();

  if(convo.length === 1) {
    obcy.silentCounter += 1;
    console.log(obcy.silentCounter);
  }

  return (obcy.silentCounter >= treshold)
}
