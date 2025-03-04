const { decodeMidiBytesToFloat } = require("./utils");

function getGain(data) {
  const gain = decodeMidiBytesToFloat(data);
  console.debug("gain", gain);
}

function setGain() {}

function getPan(data) {
  const pan = decodeMidiBytesToFloat(data);

  console.debug("pan", pan);
}

function getNumDecks(data) {
  const decks = data[0];
  console.debug("pan", decks);
}

function getCrossfader(data) {
  const crossfader = decodeMidiBytesToFloat(data);

  console.debug("crossfader", crossfader);
}

const MasterProps = [
  {
    get: getGain,
  },
  {
    get: getPan,
  },
  {
    get: getNumDecks,
  },
  {
    get: getCrossfader,
  },
];

exports.parseMidiArgs = function parseMidiArgs(midiData) {
  const [key, ...data] = midiData;

  if (MasterProps[key]) {
    MasterProps[key].get(data);
  }
};
