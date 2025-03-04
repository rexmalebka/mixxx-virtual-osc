const master = require("./master");
const channels = require("./channels");

const midi = require("midi");

const output = new midi.Output();
const input = new midi.Input();

input.ignoreTypes(false, false, false);

const MIDI_PORTNAME = process.env.MIDI_PORTNAME || "mixxx-virtual-osc";

output.openVirtualPort(MIDI_PORTNAME);
input.openVirtualPort(MIDI_PORTNAME);

input.on("message", function (delta, message) {
  if (message[0] == 0xf0 && message[message.length - 1] == 0xf7) {
    const [context, ...params] = message.slice(1, -1);

    if (context == 1) {
      // Master context
      master.parseMidiArgs(params);
    } else if (context == 2) {
      channels.parseMidiArgs(params);
    }
  }
});

process.on("SIGINT", function () {
  input.closePort();
  output.closePort();
  process.exit();
});

console.debug(`starting midi "${MIDI_PORTNAME}"`);

process.stdin.resume();
