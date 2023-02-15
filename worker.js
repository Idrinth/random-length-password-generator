(async () => {
    importScripts('dictionary.js');
    const scripts = await (await fetch('scripts.json')).json();
    for (const script of Object.keys(scripts)) {
        importScripts(`https://cdn.jsdelivr.net/npm/@zxcvbn-ts/${script}@${scripts[script]}/dist/zxcvbn-ts.js`);
    }
    const dictionary = {};
    fillDictionary(dictionary);
    self.onmessage = (e) => {
        const strength = zxcvbnts.core.zxcvbn(e.data);
        self.postMessage(JSON.encode(strength));
    }
})();