async function uxOnOpen() {
    try {
        const metrics = await getData('ux');
    }
    catch(e) {
        await setData('ux', {
            rating: {
                accepted: false,
                last_asked: 0
            }
        });
    }

    feedbackQuestionWatcher();
}

async function feedbackQuestionWatcher() {
    const metrics = await getData('metrics');
    const ux = await getData('ux');
    
    if(!ux.rating.accepted) {
        if(metrics.minutes_counter > 60) {
            const t = Date.now();
            if(ux.rating.last_asked + 259200000 < t) {
                const prefs = await getData('prefs');
                if(window.confirm(translateMsg("Hej, tu 6bot!\nCzy " + (prefs.user.sex ? 'mógłbyś' : 'mogłabyś') + ' ocenić jak działam?', prefs.user))) {
                    ux.rating.accepted = true;
                    window.open('https://chrome.google.com/webstore/detail/6bot/nnckhobpojcmpdakklaondphkgceadnm', '_blank');
                }
                else {
                    ux.rating.last_asked = t;
                }
                setData('ux', ux).then(feedbackQuestionWatcher);
            }
            else {
                setTimeout(feedbackQuestionWatcher, (ux.rating.last_asked + 259200000 - t));
            }
        }
        else {
            setTimeout(feedbackQuestionWatcher, (61-metrics.minutes_counter)*60000);
        }
    }
}