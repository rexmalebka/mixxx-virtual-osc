const { decodeMidiBytesToFloat, encodeFloatToMidiBytes } = require("../utils");

class MasterControl {
  constructor(input, output) {
    this.input = input;
    this.output = output;

    // input.on("message", function (_delta, raw_message) {
    //   if (
    //     !(raw_message[0] == 0xf0 && raw_message[raw_message.length - 1] == 0xf7)
    //   )
    //     return;

    //   const [context, ...data] = raw_message.slice(1, -1);

    //   if (context != 1) return;

    //   const [key, ...params] = data;
    //   console.debug("mesage", key, params);
    //   switch (key) {
    //     case 0:
    //       this.gain_ = decodeMidiBytesToFloat(params);
    //       break;
    //     case 1:
    //       this.pan_ = decodeMidiBytesToFloat(params);
    //       break;
    //     case 2:
    //       this.num_decks_ = params[0];
    //       break;
    //     case 3:
    //       this.crossfader_ = decodeMidiBytesToFloat(params);
    //       console.debug(this.crossfader, "aaaaaaaaaa");
    //       break;
    //   }
    // });
  }

  #GetValue(key) {
    const master = this;

    return new Promise((res, rej) => {
      const callback = (_delta, message) => {
        if (!(message[0] == 0xf0 && message[message.length - 1] == 0xf7))
          return;

        const [context, prop, ...params] = message.slice(1, -1);
        if (context != 1) return;

        if (key == prop) {
          master.input.off("message", callback);

          const value =
            params.length == 1 ? params[0] : decodeMidiBytesToFloat(params);
          master.input.off("message", callback);

          res(value);
        }
      };

      master.input.on("message", callback);
      master.output.sendMessage([0xf0, 0x01, key, 0xf7]);

      setTimeout(() => {
        master.input.off("message", callback);

        // rej("timeout");
      }, 1000);
    });
  }

  #setValue(key, value) {
    if (value.length == 0) return;

    this.output.sendMessage([0xf0, 0x01, key, ...value, 0xf7]);
  }

  get gain() {
    return this.#GetValue(0x00);
  }
  get pan() {
    return this.#GetValue(0x001);
  }
  get crossfader() {
    return this.#GetValue(0x002);
  }

  set gain(value) {
    if (value >= 0 && value <= 5) {
      this.#setValue(0x00, encodeFloatToMidiBytes(value));
    }

    return value;
  }

  set pan(value) {
    if (value >= -1 && value <= 1) {
      this.#setValue(0x00, encodeFloatToMidiBytes(value));
    }
    this.#setValue(0x01, encodeFloatToMidiBytes(value));
    return value;
  }

  set crossfader(value) {
    if (value >= -1 && value <= 1) {
      this.#setValue(0x03, encodeFloatToMidiBytes(value));
    }
    return value;
  }
}
module.exports = MasterControl;
