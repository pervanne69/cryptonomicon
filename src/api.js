export const API_KEY = 'ec84f8efeadac885c129e0c70798f75f470ec257016a933fd645439542cbd8ce'

const tickersHandlers = new Map()

//TODO: refactor to use URLSearchParams
const loadTickers = () => {
    if (!tickersHandlers.size) {
        return
    }
    return fetch(
        `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${[...tickersHandlers.keys()].join(',')}&tsyms=USD&api_key=${API_KEY}`
    ).then(r => r.json()).then(rawData => {
        const updatedPrices = Object.fromEntries(
            Object.entries(rawData).map(([key, value]) => [key, value.USD]))
        Object.entries(updatedPrices).forEach(([currency, newPrice]) => {
            const handlers = tickersHandlers.get(currency) ?? []
            handlers.forEach(fn => fn(newPrice))
        })
    })
}


export const subscribeToTicker = (ticker, cb) => {
    const subscribers = tickersHandlers.get(ticker) || []
    tickersHandlers.set(ticker, [...subscribers, cb])
}

export const unSubscribeToTicker = ticker => {
    tickersHandlers.delete(ticker)
}

setInterval(loadTickers, 5000)

window.tickers = tickersHandlers
// Получить стоимость криптовалютных пар с API?
// получать обновления стоимости криптовалютных пра с api

