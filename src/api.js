const API_KEY =
  "d666fd15978b6c2e7db58b39dbb23d5087dcf9b1e44a5cff7ceb170768026153";

const tickersHandlers = new Map();
const socket = new WebSocket(
  `wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`
);

const AGGREGATE_INDEX = "5";

let convertValue;

socket.addEventListener("message", (e) => {
  const {
    TYPE: type,
    FROMSYMBOL: currency,
    PRICE: newPrice,
    PARAMETER: parameter,
    MESSAGE: message,
    TOSYMBOL: toTicker
  } = JSON.parse(e.data);

  const newTickerData = {
    newPrice: newPrice,
    newValid: true
  };

  if (currency === "BTC") {
    convertValue = newPrice;
  }

  if (type === "500" && message === "INVALID_SUB") {
    const tickerName = parameter.split("~")[2];
    const subsTicker = parameter.split("~")[3];

    if (subsTicker !== "BTC") {
      if (!tickersHandlers.get("BTC")) {
        sendToWebSocket({
          action: "SubAdd",
          subs: [`5~CCCAGG~BTC~USD`]
        });
        tickersHandlers.set("BTC", []);
      }
      sendToWebSocket({
        action: "SubAdd",
        subs: [`5~CCCAGG~${tickerName}~BTC`]
      });

      return;
    }

    newTickerData.newValid = false;
    newTickerData.newPrice = "-";

    const handlers = tickersHandlers.get(tickerName) ?? [];
    handlers.forEach((fn) => fn(newTickerData));

    tickersHandlers.delete(tickerName);
    return;
  }

  if (type !== AGGREGATE_INDEX) {
    return;
  }

  if (newPrice === undefined) {
    return;
  }

  if (toTicker === "BTC") {
    const convertedPrice = newPrice * convertValue;
    newTickerData.newPrice = convertedPrice;
  }

  const handlers = tickersHandlers.get(currency) ?? [];
  handlers.forEach((fn) => fn(newTickerData));
});

function sendToWebSocket(message) {
  const stringifiedMessage = JSON.stringify(message);

  if (socket.readyState === WebSocket.OPEN) {
    socket.send(stringifiedMessage);
    return;
  }

  socket.addEventListener(
    "open",
    () => {
      socket.send(stringifiedMessage);
    },
    { once: true }
  );
}

function subscribeToTickerOnWs(ticker) {
  sendToWebSocket({
    action: "SubAdd",
    subs: [`5~CCCAGG~${ticker}~USD`]
  });
}

function unsubscribeFromTickerOnWs(ticker) {
  sendToWebSocket({
    action: "SubRemove",
    subs: [`5~CCCAGG~${ticker}~USD`]
  });
  sendToWebSocket({
    action: "SubRemove",
    subs: [`5~CCCAGG~${ticker}~BTC`]
  });
}

export const subscribeToTicker = (ticker, cb) => {
  if (!tickersHandlers.get(ticker)) {
    subscribeToTickerOnWs(ticker);
  }

  const subscribers = tickersHandlers.get(ticker) || [];
  tickersHandlers.set(ticker, [...subscribers, cb]);
};

export const unsubscribeFromTicker = (ticker) => {
  tickersHandlers.delete(ticker);
  unsubscribeFromTickerOnWs(ticker);
};

export const fetchTickersName = async () => {
  return await fetch(
    `https://min-api.cryptocompare.com/data/all/coinlist?summary=true`
  );
};
