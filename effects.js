const { decodeMidiBytesToFloat } = require("./utils");

const EffectProps{

}

exports.parseMidiArgs = function parseMidiArgs(midiData) {
    const [channel, key, ...data] = midiData;
  
    if (ChannelProps[key]) {
      ChannelProps[key].get(channel, data);
    } else {
      console.debug(key, data);
    }
  };
  