import fs from 'node:fs';
import {Config} from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(92);
Config.setCodec('h264');
Config.setCrf(18);
Config.setOverwriteOutput(true);
Config.setPixelFormat('yuv420p');

// Use the Chromium that ships with this sandbox when it exists; otherwise Remotion downloads its own.
const sandboxChrome = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
if (fs.existsSync(sandboxChrome)) {
  Config.setBrowserExecutable(sandboxChrome);
}
