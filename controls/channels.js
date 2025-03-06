const { decodeMidiBytesToFloat } = require("../utils");

class ChannelControl {
  constructor(deck, input, output) {
    this.number = deck;
    this.input = input;
    this.output = output;

    // midiin.on("message", function (_delta, raw_message) {
    //   if (
    //     !(raw_message[0] == 0xf0 && raw_message[raw_message.length - 1] == 0xf7)
    //   )
    //     return;

    //   const [context, ...data] = raw_message.slice(1, -1);

    //   if (context != 2) return;

    //   const [channel, key, ...params] = data;

    //   if (channel != deck) return;

    //   switch (key) {
    //     case 0:
    //       this.bpm = decodeMidiBytesToFloat(params);
    //       break;
    //     case 1:
    //       this.volume = decodeMidiBytesToFloat(params);
    //       break;
    //     case 2:
    //       this.pitch = decodeMidiBytesToFloat(params);
    //       break;
    //     case 3:
    //       this.rate = decodeMidiBytesToFloat(params);
    //       break;
    //     case 4:
    //       this.reverse = params[0] == 0 ? false : true;
    //       break;
    //     case 5:
    //       this.beat_active = params[0] == 0 ? false : true;
    //       break;
    //     case 6:
    //       this.playing = params[0] == 0 ? false : true;
    //       break;
    //     case 7:
    //       this.loop_enabled = params[0] == 0 ? false : true;
    //       break;
    //     case 8:
    //       this.loop_start = decodeMidiBytesToFloat(params);
    //       break;
    //     case 9:
    //       this.loop_end = decodeMidiBytesToFloat(params);
    //       break;
    //     case 10:
    //       this.play_position = decodeMidiBytesToFloat(params);
    //       break;
    //     case 11:
    //       this.track_loaded = params[0] == 0 ? false : true;
    //       break;
    //     case 12:
    //       this.track_samplerate = decodeMidiBytesToFloat(params);
    //       break;
    //     case 13:
    //       this.track_samples = decodeMidiBytesToFloat(params);
    //       break;
    //   }
    // });
  }

  #GetValue(key) {
    const channel = this;

    return new Promise((res, rej) => {
      const callback = (_delta, message) => {
        if (!(message[0] == 0xf0 && message[message.length - 1] == 0xf7))
          return;

        const [context, channel_number, prop, ...params] = message.slice(1, -1);

        if (context != 2) return;

        if (channel_number != channel.number || key != prop) return;

        channel.input.off("message", callback);

        const value =
          params.length == 1 ? params[0] : decodeMidiBytesToFloat(params);
        channel.input.off("message", callback);

        res(value);
      };

      channel.input.on("message", callback);
      channel.output.sendMessage([0xf0, 0x02, channel.number, key, 0xf7]);

      setTimeout(() => {
        channel.input.off("message", callback);

        // rej("timeout");
      }, 1000);
    });
  }

  get bpm() {
    return this.#GetValue(0x00);
  }
  get volume() {
    return this.#GetValue(0x01);
  }
  get pitch() {
    return this.#GetValue(0x02);
  }
  get rate() {
    return this.#GetValue(0x03);
  }
  get reverse() {
    return this.#GetValue(0x04);
  }
  get beat_active() {
    return this.#GetValue(0x05);
  }
  get playing() {
    return this.#GetValue(0x06);
  }
  get loop_enabled() {
    return this.#GetValue(0x07);
  }
  get loop_start() {
    return this.#GetValue(0x08);
  }
  get loop_end() {
    return this.#GetValue(0x09);
  }
  get play_position() {
    return this.#GetValue(0x10);
  }
  get track_loaded() {
    return this.#GetValue(0x11);
  }
  get track_samplerate() {
    return this.#GetValue(0x12);
  }
  get track_samples() {
    return this.#GetValue(0x13);
  }
  
}

module.exports = ChannelControl;
