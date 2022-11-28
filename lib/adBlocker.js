function removeAds() {
    const ads = document.querySelectorAll('div.szobcy-da');
    for(ad of ads) {
        ad.parentNode.removeChild(ad);
    }
}