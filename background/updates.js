async function as_updater() {
    try {
        const stamp = await getData('as_stamp');
        if (Date.now() >= (stamp + 3600000)) { //1 hour
            try {
                const response = await fetch("https://6bot.chaueq.com/api/antispam.json");
                const data = await response.json();
                await setData('as_data', data);
                await setData('as_stamp', Date.now());
            }
            catch(e) {
                console.log(e);
            }
        }
    }
    catch(e) {
        await setData('as_stamp', 0);
        as_updater();
        return;
    }

    setTimeout(as_updater, 900000); //15 minutes
}