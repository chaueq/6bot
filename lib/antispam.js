function isSPAM(msg) {
  return (
   /sprzedaj[eę]/g.test(msg)
|| /kto pyta/g.test(msg)
|| /odp[łl]atnie/g.test(msg)
|| /(szukam)? ?(par(y|ki))/g.test(msg)
|| /\d+ ?z[lł]/g.test(msg)
|| /trans/g.test(msg)
  );
}
