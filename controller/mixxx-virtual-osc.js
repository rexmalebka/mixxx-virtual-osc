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
  for (const control in MasterControls) {
    engine.makeConnection("[Master]", control, MasterControls[control]);
  }

  for (let deck = 1; deck <= 4; deck++) {
    Object.entries(ChannelControls).forEach(([control, handler]) => {
      engine.makeConnection(`[Channel${deck}]`, control, (value) =>
        handler(deck, value)
      );
    });

    engine.makeConnection(
      `[EqualizerRack1_[Channel${deck}]_Effect1]`,
      "parameter1",
      (value) => onEQChange(value, "low", deck)
    );
    engine.makeConnection(
      `[EqualizerRack1_[Channel${deck}]_Effect1]`,
      "parameter2",
      (value) => onEQChange(value, "mid", deck)
    );
    engine.makeConnection(
      `[EqualizerRack1_[Channel${deck}]_Effect1]`,
      "parameter3",
      (value) => onEQChange(value, "high", deck)
    );
  }
};

VirtualOSC.shutdown = () => {
  console.debug("bye");
};
