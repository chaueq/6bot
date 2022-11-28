function convoEnded() {
  const pauseText = "Rozłącz się\nESC";
  const btn = document.querySelector('button.o-esc');

  return (pauseText != btn.innerText)
}
