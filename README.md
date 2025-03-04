# Virtual OSC Mixxx controller

This mixxx controller allows to get and set mixxx controls using OSC.

*Work in progress* 

## How to

### copy controller files
> cp controller/* ~/.mixxx/controllers

### install dependecies
> npm install 

### run server
> node mixxx-virtual-osc.js



| Mixxx event        | Midi | OSC Address    | OSC Args               |
| ------------------ | ---- | -------------- | ---------------------- |
| [ChannelN] play    |      | /channelN/play | 0 for pause, 127 play  |
| [ChannelN] reverse |      | /channelN/rev  | 0 for forward, 127 rev |
| [ChannelN] mute    |      | /channelN/mute | 0 for unmute, 127 mute |
| [ChannelN] low     |      | /channelN/low  | 0 - 127                |

## Implemented controls

### Master 
- \[Master\] gain
- \[Master\] balance
- \[Master\] num_decks
- \[Master\] crossfader

### Channel
- \[ChannelX\] bpm
- \[ChannelX\] volume 
- \[ChannelX\] pitch 
- \[ChannelX\] rate 
- \[ChannelX\] reverse 
- \[ChannelX\] beat_active 
- \[ChannelX\] play 
- \[ChannelX\] loop_enabled 
- \[ChannelX\] loop_start_position 
- \[ChannelX\] loop_end_position 
- \[ChannelX\] loop_move
- \[ChannelX\] loop_double
- \[ChannelX\] loop_halve
- \[ChannelX\] playposition
- \[ChannelX\] track_loaded
- \[ChannelX\] track_samplerate
- \[ChannelX\] track_samples
