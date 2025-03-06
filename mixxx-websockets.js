const midi = require("midi");
const logger = require("./logger");

const ChannelControl = require("./controls/channels");
const MasterControl = require("./controls/master");

function setupMidiPorts() {
  const output = new midi.Output();
  const input = new midi.Input();

  input.ignoreTypes(false, false, false);

  const MIDI_PORTNAME = process.env.MIDI_PORTNAME || "mixxx-virtual-osc";

  try {
    output.openVirtualPort(MIDI_PORTNAME);
    input.openVirtualPort(MIDI_PORTNAME);

    logger.info(`opening midi ports "${MIDI_PORTNAME}"`);
  } catch (setupError) {
    logger.error("Failed to set up MIDI ports:", setupError);
    process.exit(1);
  }

  const master = new MasterControl(input, output);
  const channel1 = new ChannelControl(1, input, output);

  // const decks = Array.from(
  //   { length: 4 },
  //   (_, i) => new ChannelControl(i + 1, input)
  // );

  setInterval(function () {
    (async () => {
      // console.debug("bpm 1:", await channel1.bpm);
      // console.debug("volume 1:", await channel1.volume);
      // console.debug("pitch 1:", await channel1.pitch);
      // console.debug("rate 1:", await channel1.rate);
      console.debug("reverse 1:", await channel1.reverse);
      // console.debug("beat_active 1:", await channel1.beat_active);
      // console.debug("playing 1:", await channel1.playing);
      // console.debug("loop_enabled 1:", await channel1.loop_enabled);
      console.debug("loop start 1:", await channel1.loop_start);
      console.debug("loop end 1:", await channel1.loop_end);

      console.debug("\n\n");
    })();
  }, 1000);

  input.on("error", (err) => {
    logger.error("MIDI Input Error:", err);
  });

  process.on("SIGINT", function () {
    logger.info(`closing midi ports`);

    input.closePort();
    output.closePort();
    process.exit();
  });
}

setupMidiPorts();
process.stdin.resume();
