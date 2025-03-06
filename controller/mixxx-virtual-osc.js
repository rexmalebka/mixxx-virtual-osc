// eslint-disable-next-line no-var
var VirtualOSC = {};

const prefixMaster = [0xf0, 0x01];
const prefixChannels = [0xf0, 0x02];

function encodeFloatToMidiBytes(floatValue) {
  // Create a buffer to hold the float value
  const buffer = new ArrayBuffer(4);
  const view = new DataView(buffer);

  // Write the float value into the buffer
  view.setFloat32(0, floatValue, true); // true for little-endian

  // Convert the buffer to an array of bytes
  const bytes = new Uint8Array(buffer);

  // Split the 32-bit float into 5 MIDI-safe bytes (7 bits each)
  const midiBytes = [];
  for (let i = 0; i < bytes.length; i++) {
    // Split each byte into two 7-bit chunks
    midiBytes.push(bytes[i] & 0x7f); // Lower 7 bits
    midiBytes.push((bytes[i] >> 7) & 0x7f); // Upper 1 bit
  }

  // Trim the last byte if it's zero (to optimize size)
  while (midiBytes.length > 5 && midiBytes[midiBytes.length - 1] === 0) {
    midiBytes.pop();
  }

  return midiBytes;
}

function decodeMidiBytesToFloat(midiBytes) {
  // Reconstruct the original bytes from the MIDI-safe bytes
  const bytes = new Uint8Array(4);
  for (let i = 0; i < midiBytes.length; i += 2) {
    const lower7 = midiBytes[i];
    const upper1 = midiBytes[i + 1] || 0; // Default to 0 if missing
    bytes[i / 2] = (upper1 << 7) | lower7;
  }

  // Create a buffer to hold the bytes
  const buffer = new ArrayBuffer(4);
  const view = new DataView(buffer);

  // Write the bytes into the buffer
  bytes.forEach((byte, index) => view.setUint8(index, byte));

  // Read the float value from the buffer
  const floatValue = view.getFloat32(0, true); // true for little-endian

  return floatValue;
}

function sendMaster(index, value, scale = 100) {
  let msg = [...prefixMaster, index];

  msg.push(...encodeFloatToMidiBytes(value, scale), 0xf7);

  midi.sendSysexMsg(msg, msg.length);
}

function sendChannel(channel, index, value, scale = 100) {
  let msg = [...prefixChannels, channel, index];

  msg.push(...encodeFloatToMidiBytes(value, scale), 0xf7);
  midi.sendSysexMsg(msg, msg.length);
}

function onEQChange(value, band, channel) {
  // console.log(`Channel ${channel} ${band} EQ changed to:`, value);
  // Example: Send the new EQ value via MIDI
  //  sendChannel(channel, band === "low" ? 6 : band === "mid" ? 7 : 8, value);
}

const MasterControls = {
  gain(value) {
    sendMaster(0, value);
  },
  balance(value) {
    sendMaster(1, value);
  },
  num_decks(value) {
    sendMaster(2, value);
  },
  crossfader(value) {
    sendMaster(3, value);
  },
};

const ChannelControls = {
  bpm(channel, value) {
    sendChannel(channel, 0, value);
  },
  volume(channel, value) {
    sendChannel(channel, 1, value);
  },
  pitch(channel, value) {
    sendChannel(channel, 2, value);
  },
  rate(channel, value) {
    sendChannel(channel, 3, value);
  },
  reverse(channel, value) {
    const msg = [...prefixChannels, channel, 4, value, 0xf7];
    midi.sendSysexMsg(msg, msg.length);
  },
  beat_active(channel, value) {
    const msg = [...prefixChannels, channel, 5, value, 0xf7];
    midi.sendSysexMsg(msg, msg.length);
  },

  play(channel, value) {
    const msg = [...prefixChannels, channel, 6, value, 0xf7];

    midi.sendSysexMsg(msg, msg.length);
  },
  loop_enabled(channel, value) {
    const msg = [...prefixChannels, channel, 7, value, 0xf7];

    midi.sendSysexMsg(msg, msg.length);
  },
  loop_start_position(channel, value) {
    sendChannel(channel, 8, value);
  },
  loop_end_position(channel, value) {
    sendChannel(channel, 9, value);
  },
  loop_move(channel, value) {
    const msg = [...prefixChannels, channel, 10, value, 0xf7];

    midi.sendSysexMsg(msg, msg.length);
  },
  loop_double(channel, value) {
    const msg = [...prefixChannels, channel, 11, value, 0xf7];
    midi.sendSysexMsg(msg, msg.length);
  },
  loop_halve(channel, value) {
    const msg = [...prefixChannels, channel, 12, value, 0xf7];
    midi.sendSysexMsg(msg, msg.length);
  },
  playposition(channel, value) {
    sendChannel(channel, 13, value, 1000);
  },
  track_loaded(channel, value) {
    sendChannel(channel, 14, value, 1000);
  },
  track_samplerate(channel, value) {
    sendChannel(channel, 15, value, 1000);
  },
  track_samples(channel, value) {
    sendChannel(channel, 16, value, 1000);
  },
};

VirtualOSC.init = (id, debugging) => {
  // for (const control in MasterControls) {
  //   engine.makeConnection("[Master]", control, MasterControls[control]);
  // }
  // for (let deck = 1; deck <= 4; deck++) {
  //   Object.entries(ChannelControls).forEach(([control, handler]) => {
  //     engine.makeConnection(`[Channel${deck}]`, control, (value) =>
  //       handler(deck, value)
  //     );
  //   });
  //   engine.makeConnection(
  //     `[EqualizerRack1_[Channel${deck}]_Effect1]`,
  //     "parameter1",
  //     (value) => onEQChange(value, "low", deck)
  //   );
  //   engine.makeConnection(
  //     `[EqualizerRack1_[Channel${deck}]_Effect1]`,
  //     "parameter2",
  //     (value) => onEQChange(value, "mid", deck)
  //   );
  //   engine.makeConnection(
  //     `[EqualizerRack1_[Channel${deck}]_Effect1]`,
  //     "parameter3",
  //     (value) => onEQChange(value, "high", deck)
  //   );
  // }
};

VirtualOSC.init = (id, debugging) => {};

VirtualOSC.Master = function (key, params) {
  const PREFIX = [0xf0, 0x1];

  let msg = [...PREFIX];

  switch (key) {
    case 0:
      if (params.length == 0) {
        const gain = engine.getValue("[Master]", "gain");
        msg.push(0x00, ...encodeFloatToMidiBytes(gain), 0xf7);

        midi.sendSysexMsg(msg, msg.length);
      } else {
        const gain = decodeMidiBytesToFloat(params);
        engine.setValue("[Master]", "gain", gain);
      }

      break;
    case 1:
      if (params.length == 0) {
        const pan = engine.getValue("[Master]", "balance");
        msg.push(0x01, ...encodeFloatToMidiBytes(pan), 0xf7);

        midi.sendSysexMsg(msg, msg.length);
      } else {
        const pan = decodeMidiBytesToFloat(params);
        engine.setValue("[Master]", "balance", pan);
      }

      break;
    case 2:
      if (params.length == 0) {
        const crossfader = engine.getValue("[Master]", "crossfader");
        msg.push(0x01, ...encodeFloatToMidiBytes(crossfader), 0xf7);

        midi.sendSysexMsg(msg, msg.length);
      } else {
        const crossfader = decodeMidiBytesToFloat(params);
        engine.setValue("[Master]", "crossfader", crossfader);
      }
      break;
  }
};

VirtualOSC.Channel = function (deck, key, params) {
  const PREFIX = [0xf0, 0x2];
  let msg = [...PREFIX];

  switch (key) {
    case 0:
      if (params.length == 0) {
        const bpm = engine.getValue(`[Channel${deck}]`, "bpm");
        msg.push(deck, key, ...encodeFloatToMidiBytes(bpm), 0xf7);

        midi.sendSysexMsg(msg, msg.length);
      } else {
        const bpm = decodeMidiBytesToFloat(params);
        engine.setValue(`[Channel${deck}]`, "bpm", bpm);
      }

      break;
    case 1:
      if (params.length == 0) {
        const volume = engine.getValue(`[Channel${deck}]`, "volume");

        msg.push(deck, key, ...encodeFloatToMidiBytes(volume), 0xf7);

        midi.sendSysexMsg(msg, msg.length);
      } else {
        const volume = decodeMidiBytesToFloat(params);
        engine.setValue(`[Channel${deck}]`, "volume", volume);
      }

      break;
    case 2:
      if (params.length == 0) {
        const pitch = engine.getValue(`[Channel${deck}]`, "pitch");
        msg.push(deck, key, ...encodeFloatToMidiBytes(pitch), 0xf7);

        midi.sendSysexMsg(msg, msg.length);
      } else {
        const pitch = decodeMidiBytesToFloat(params);
        engine.setValue(`[Channel${deck}]`, "pitch", pitch);
      }

      break;
    case 3:
      if (params.length == 0) {
        const rate = engine.getValue(`[Channel${deck}]`, "rate");
        msg.push(deck, key, ...encodeFloatToMidiBytes(rate), 0xf7);

        midi.sendSysexMsg(msg, msg.length);
      } else {
        const rate = decodeMidiBytesToFloat(params);
        engine.setValue(`[Channel${deck}]`, "rate", rate);
      }

      break;
    case 4:
      if (params.length == 0) {
        const reverse = engine.getValue(`[Channel${deck}]`, "reverse");

        msg.push(deck, key, reverse, 0xf7);

        midi.sendSysexMsg(msg, msg.length);
      } else {
        const reverse = params[0];
        engine.setValue(`[Channel${deck}]`, "reverse", reverse);
      }

      break;
    case 5:
      if (params.length == 0) {
        const beat_active = engine.getValue(`[Channel${deck}]`, "beat_active");
        msg.push(deck, key, beat_active, 0xf7);

        midi.sendSysexMsg(msg, msg.length);
      }

      break;
    case 6:
      if (params.length == 0) {
        const playing = engine.getValue(`[Channel${deck}]`, "play");
        msg.push(deck, key, playing, 0xf7);

        midi.sendSysexMsg(msg, msg.length);
      } else {
        const playing = params[0];
        engine.setValue(`[Channel${deck}]`, "play", playing);
      }
      break;
    case 7:
      if (params.length == 0) {
        const loop_enabled = engine.getValue(
          `[Channel${deck}]`,
          "loop_enabled"
        );
        msg.push(deck, key, loop_enabled, 0xf7);

        midi.sendSysexMsg(msg, msg.length);
      } else {
        const loop_enabled = params[0];
        engine.setValue(`[Channel${deck}]`, "loop_enabled", loop_enabled);
      }
      break;
    case 8:
      if (params.length == 0) {
        const loop_start_position = engine.getValue(
          `[Channel${deck}]`,
          "loop_start_position"
        );
        msg.push(
          deck,
          key,
          ...encodeFloatToMidiBytes(loop_start_position),
          0xf7
        );

        midi.sendSysexMsg(msg, msg.length);
      } else {
        const loop_start_position = decodeMidiBytesToFloat(params);
        engine.setValue(
          `[Channel${deck}]`,
          "loop_start_position",
          loop_start_position
        );
      }
      break;
    case 9:
      if (params.length == 0) {
        const loop_end_position = engine.getValue(
          `[Channel${deck}]`,
          "loop_end_position"
        );
        msg.push(deck, key, ...encodeFloatToMidiBytes(loop_end_position), 0xf7);

        midi.sendSysexMsg(msg, msg.length);
      } else {
        const loop_end_position = decodeMidiBytesToFloat(params);
        engine.setValue(
          `[Channel${deck}]`,
          "loop_end_position",
          loop_start_position
        );
      }
      break;
    case 10:
      if (params.length == 0) {
        const play_position = engine.getValue(
          `[Channel${deck}]`,
          "playposition"
        );
        msg.push(deck, key, ...encodeFloatToMidiBytes(play_position), 0xf7);

        midi.sendSysexMsg(msg, msg.length);
      } else {
        const play_position = decodeMidiBytesToFloat(params);
        engine.setValue(`[Channel${deck}]`, "play_position", play_position);
      }
      break;
    case 11:
      if (params.length == 0) {
        const track_loaded = engine.getValue(
          `[Channel${deck}]`,
          "track_loaded"
        );
        msg.push(deck, key, ...encodeFloatToMidiBytes(track_loaded), 0xf7);

        midi.sendSysexMsg(msg, msg.length);
      }
      break;
    case 12:
      if (params.length == 0) {
        const track_samplerate = engine.getValue(
          `[Channel${deck}]`,
          "track_samplerate"
        );
        msg.push(deck, key, ...encodeFloatToMidiBytes(track_samplerate), 0xf7);

        midi.sendSysexMsg(msg, msg.length);
      }
      break;
    case 13:
      if (params.length == 0) {
        const track_samples = engine.getValue(
          `[Channel${deck}]`,
          "track_samples"
        );
        msg.push(deck, key, ...encodeFloatToMidiBytes(track_samples), 0xf7);

        midi.sendSysexMsg(msg, msg.length);
      }
      break;
  }
};

VirtualOSC.incomingData = (message) => {
  const [context, ...data] = message.slice(1, -1);

  switch (context) {
    case 1:
      const [MasterKey, ...MasterParams] = data;
      VirtualOSC.Master(MasterKey, MasterParams);
      break;
    case 2:
      const [ChannelNumber, ChannelKey, ...ChannelParams] = data;
      VirtualOSC.Channel(ChannelNumber, ChannelKey, ChannelParams);
      break;
  }
};

VirtualOSC.shutdown = () => {
  console.debug("bye");
};
