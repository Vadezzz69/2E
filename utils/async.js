/** Yksinkertainen odotus millisekunneissa Promise-muodossa. */
function odota(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = { odota };
