function fillDictionary(dictionaryReference, glbl)
{
    if (Object.keys(dictionaryReference).length > 0 || typeof glbl.zxcvbnts === 'undefined' || typeof zxcvbnts['language-en'] === 'undefined' || typeof zxcvbnts['language-common'] === 'undefined') {
        return;
    }
    for (const key of Object.keys(zxcvbnts)) {
        if (key.startsWith('language-')) {
            for (const prop of zxcvbnts[key]) {
                dictionary[prop] = zxcvbnts[key][prop];
            }
        }
    }
    zxcvbnts.core.zxcvbnOptions.setOptions({
        translations: zxcvbnts['language-en'].translations,
        graphs: zxcvbnts['language-common'].adjacencyGraphs,
        dictionary: dictionaryReference,
    });
}