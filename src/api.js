

export const API_KEY = 'ec84f8efeadac885c129e0c70798f75f470ec257016a933fd645439542cbd8ce'

const tickersHandlers = new Map()

const AGGREGATE_INDEX = "5"

const socket = new WebSocket(
    `wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`
)

socket.addEventListener('message', e => {
    const {TYPE: type, FROMSYMBOL: currency, PRICE: newPrice} = JSON.parse(e.data)
    if (type !== AGGREGATE_INDEX || newPrice === undefined) {
        return
    }
    const handlers = tickersHandlers.get(currency) ?? []
    handlers.forEach(fn => fn(newPrice))


})

function sendToWebSocket(message) {
    const stringifiedMessage = JSON.stringify(message)
    if (socket.readyState === WebSocket.OPEN) {
        socket.send(stringifiedMessage)
        return
    }
    socket.addEventListener('open', () => {
        socket.send(stringifiedMessage)
    }, {once: true})
}


function subscribeToTickerOnWebSocket(ticker) {
    sendToWebSocket(
        {
            "action": "SubAdd",
            "subs": [`5~CCCAGG~${ticker}~USD`]
        }
    )
}

function unsubscribeFromTickerOnWebSocket(ticker) {
    sendToWebSocket(
        {
            "action": "SubRemove",
            "subs": [`5~CCCAGG~${ticker}~USD`]
        }
    )
}

export const subscribeToTicker = (ticker, cb) => {
    const subscribers = tickersHandlers.get(ticker) || []
    tickersHandlers.set(ticker, [...subscribers, cb])
    subscribeToTickerOnWebSocket(ticker)

}

export const unSubscribeFromTicker = ticker => {
    tickersHandlers.delete(ticker)
    unsubscribeFromTickerOnWebSocket(ticker)
}

