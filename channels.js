const { decodeMidiBytesToFloat } = require("./utils");

function getBpm(channel, data) {
  const bpm = decodeMidiBytesToFloat(data);
  console.debug(`channel ${channel} bpm: ${bpm}`);
}

function getVolume(channel, data) {
  const volume = decodeMidiBytesToFloat(data);
  console.debug(`channel ${channel} volume: ${volume}`);
}

function getPitch(channel, data) {
  const pitch = decodeMidiBytesToFloat(data);

  console.debug(`channel ${channel} pitch: ${pitch}`);
}

function getRate(channel, data) {
  const rate = decodeMidiBytesToFloat(data);

  console.debug(`channel ${channel} rate: ${rate}`);
}

function getReverse(channel, data) {
  const rev = data[0];
  console.debug(`channel ${channel} rev: ${rev}`);
}

function getBeatActive(channel, data) {
  const active = data[0];
  console.debug(`channel ${channel} beat active: ${active}`);
}

function getPlay(channel, data) {
  const playing = data[0];
  console.debug(`channel ${channel} playing: ${playing}`);
}

function getLoopEnabled(channel, data) {
  const playing = data[0];
  console.debug(`channel ${channel} loop enabled: ${playing}`);
}

function getLoopStartPosition(channel, data) {
  const start_position = decodeMidiBytesToFloat(data);

  console.debug(`channel ${channel} loop start position: ${start_position}`);
}

function getLoopEndPosition(channel, data) {
  const end_position = decodeMidiBytesToFloat(data);

  console.debug(`channel ${channel} loop start position: ${end_position}`);
}

function getLoopMove() {}

function getLoopDouble() {}

function getLoopHalve() {}

function getPlayPosition(channel, data) {
  const play_position = decodeMidiBytesToFloat(data);
  //console.debug(`channel ${channel} play position: ${play_position}`);
}

function getTrackLoaded(channel, data) {
  const loaded = data[0];

  console.debug(`channel ${channel} track loaded: ${loaded}`);
}

function getTrackSampleRate(channel, data) {
  const TrackSamplerate = decodeMidiBytesToFloat(data);

  console.debug(`channel ${channel} track sample rate: ${TrackSamplerate}`);
}

function getTrackSamples(channel, data) {
  const TrackSamples = decodeMidiBytesToFloat(data);

  console.debug(`channel ${channel} track samples: ${TrackSamples}`);
}

const ChannelProps = [
  {
    get: getBpm,
  },
  {
    get: getVolume,
  },
  {
    get: getPitch,
  },
  {
    get: getRate,
  },
  {
    get: getReverse,
  },
  {
    get: getBeatActive,
  },
  {
    get: getPlay,
  },
  {
    get: getLoopEnabled,
  },
  {
    get: getLoopStartPosition,
  },
  {
    get: getLoopEndPosition,
  },
  {
    get: getLoopMove,
  },
  {
    get: getLoopDouble,
  },
  {
    get: getLoopHalve,
  },
  {
    get: getPlayPosition,
  },
  {
    get: getTrackLoaded,
  },
  {
    get: getTrackSampleRate,
  },
  {
    get: getTrackSamples,
  },
];

exports.parseMidiArgs = function parseMidiArgs(midiData) {
  const [channel, key, ...data] = midiData;

  if (ChannelProps[key]) {
    ChannelProps[key].get(channel, data);
  } else {
    console.debug(key, data);
  }
};
