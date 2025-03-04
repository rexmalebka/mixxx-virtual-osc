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

exports.encodeFloatToMidiBytes = encodeFloatToMidiBytes;
exports.decodeMidiBytesToFloat = decodeMidiBytesToFloat;
