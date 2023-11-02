async function lockBg() {
    await bgUnlocked();
    await setData('bg_lock', true, false);
}

function unlockBg() {
    return setData('bg_lock', false, false);
}

async function isBgLocked() {
    try {
        return await getData('bg_lock', false);
    } catch(e) {
        return false;
    }
}

async function bgUnlocked() {
    while(await isBgLocked()) {
        await sleep(100);
    }
}