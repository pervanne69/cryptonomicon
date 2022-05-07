
export const API_KEY = 'ec84f8efeadac885c129e0c70798f75f470ec257016a933fd645439542cbd8ce'

export let coinList = []

// const coinsCrossOptimizersList = ["USDT", "BTC", "USD", "ETH"]
//
// function coinsCrossOptimizerFunc(ticker) {
//     ticker.rate = coinsCrossOptimizersList[ticker.coinIndex]
//     setInterval(() => {
//         if (ticker.isExists === false) {
//             unSubscribeFromTicker(ticker.name.toUpperCase(),ticker.rate)
//             ticker.coinIndex = currentTicker.coinIndex += 1
//             currentTicker.rate = this.coinsCrossOptimizers[currentTicker.coinIndex]
//             subscribeToTicker(currentTicker.name.toUpperCase(), (newPrice) => this.updateTicker(currentTicker.name.toUpperCase(), newPrice), currentTicker.rate)
//             if (currentTicker.isExists === true) {
//                 return
//             }
//         }
//     }, 2000)
// }



fetch(`https://min-api.cryptocompare.com/data/top/totaltoptiervolfull?limit=100&tsym=USD&api_key=${API_KEY}`)
    .then(response => response.json())
    .then(json => json['Data'].map(t => {
        coinList.push(t['CoinInfo']['Name'])
    }))

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


// function crossCryptoCourseOptimizer() {
//     socket.onmessage = e => {
//         const {TYPE: type, MESSAGE: message} = JSON.parse(e.data)
//         if (type === "500" && message === "INVALID_SUB") {
//             const {PARAMETER: parameter} = JSON.parse(e.data)
//             const arrayedParameter = parameter.toString().split('~')
//             if (arrayedParameter[3] === "BTC") {
//                 rate = "USD"
//             } else if (arrayedParameter[3] === "USD") {
//                 rate = "BTC"
//             }
//         }
//     }
//     return rate
// }



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


function subscribeToTickerOnWebSocket(ticker, rate) {
    sendToWebSocket(
        {
            "action": "SubAdd",
            "subs": [`5~CCCAGG~${ticker.toUpperCase()}~${rate}`]
        }
    )
}

function unsubscribeFromTickerOnWebSocket(ticker, rate) {
    sendToWebSocket(
        {
            "action": "SubRemove",
            "subs": [`5~CCCAGG~${ticker.toUpperCase()}~${rate}`]
        }
    )
}

export const subscribeToTicker = (ticker, cb, rate) => {
    const subscribers = tickersHandlers.get(ticker.toUpperCase()) || []
    tickersHandlers.set(ticker.toUpperCase(), [...subscribers, cb])
    subscribeToTickerOnWebSocket(ticker.toUpperCase(), rate)

}

export const unSubscribeFromTicker = (ticker, rate) => {
    tickersHandlers.delete(ticker)
    unsubscribeFromTickerOnWebSocket(ticker.toUpperCase(), rate)
}