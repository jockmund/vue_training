// const API_KEY =
//   "8ee0f4aff0301a14ad75f1bae50a18a1a87db102e3edeb45cc25600446bce815";

const tickersHandlers = new Map();
// const socket = new WebSocket(
//   `wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`
// );
//
// const AGGREGATE_INDEX = 5;
//
// socket.addEventListener("message", (e) => {
//   const {
//     TYPE: type,
//     FROMSYMBOL: currency,
//     PRICE: newPrice
//   } = JSON.parse(e.data);
//   if (type !== AGGREGATE_INDEX) {
//     return;
//   }
//
//   const handlers = tickersHandlers.get(currency) ?? [];
//   handlers.forEach((fn) => fn(newPrice));
// });

const loadTickers = () => {
  if (tickersHandlers.size === 0) {
    return;
  }

  const apiUrl = new URL("https://min-api.cryptocompare.com/data/pricemulti");
  apiUrl.searchParams.append("fsyms", [...tickersHandlers.keys()].join(","));
  apiUrl.searchParams.append("tsyms", "USD");
  // apiUrl.searchParams.append("api_key", API_KEY);

  fetch(apiUrl.toString())
    .then((r) => r.json())
    .then((rawData) => {
      const updatedPrices = Object.fromEntries(
        Object.entries(rawData).map(([key, value]) => [key, value["USD"]])
      );

      Object.entries(updatedPrices).forEach(([currency, newPrice]) => {
        const handlers = tickersHandlers.get(currency) ?? [];
        handlers.forEach((fn) => fn(newPrice));
      });
    });
};

// function subscribeToTickerOnWs(ticker) {
//   const message = JSON.stringify({
//     action: "SubAdd",
//     subs: [`5~CCCAGG~${ticker}~USD`]
//   });
//   if (socket.readyState === WebSocket.OPEN) {
//     socket.send(message);
//     return;
//   }
//
//   socket.addEventListener(
//     "open",
//     () => {
//       socket.send(message);
//     },
//     { once: true }
//   );
// }

export const subscribeToTicker = (ticker, cb) => {
  const subscribers = tickersHandlers.get(ticker) || [];
  tickersHandlers.set(ticker, [...subscribers, cb]);
  // subscribeToTickerOnWs(ticker);
};

export const unsubscribeFromTicker = (ticker) => {
  tickersHandlers.delete(ticker);
};

setInterval(loadTickers, 5000);
