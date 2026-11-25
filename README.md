# Terminal Bloom

A standalone, indefinitely running music-reactive ASCII / Unicode art instrument. Separate from any other visualiser. No installation of app packages, accounts, external fonts, uploads, or network services. All rendering and audio analysis happen in your browser.

## Open online

Visit **https://absoluteunit15.github.io/TerminalBloom/**. No installation is needed. Audio files and microphone/system audio are processed locally in your browser.

GitHub Pages serves the app over HTTPS, supporting microphone and PC / tab audio capture in compatible browsers. For PC / tab audio, use desktop Chrome or Edge and enable audio sharing in the browser picker.

## Publish with GitHub Pages

In this repository, open **Settings → Pages**, choose **Deploy from a branch**, select **main** and **/ (root)**, then save. Changes pushed to `main` publish automatically. The `.nojekyll` file serves the static files directly; no build, packages, backend, or API keys are required. All app asset URLs are relative so the `/TerminalBloom/` project path works.

## Start locally

1. Install a current Node.js LTS version from https://nodejs.org if you don't have Node.js.
2. On Windows, double-click **Start Terminal Bloom.cmd**. Or open a terminal in this folder and run `node server.cjs`.
3. Open **http://localhost:8787** in Chrome, Edge, Firefox or Safari. Keep the server window open while using the app. Stop it with Ctrl+C.

You can also open `index.html` directly for idle art and local audio playback; the localhost route is recommended, especially for microphone permissions. Nothing is downloaded by the app. The server listens only on your own computer.

## Use

- **Use PC / tab audio** reacts to sound already playing on your computer. For all PC audio on Windows, open the app in desktop Chrome or Edge, click the button, choose **Entire screen**, select your screen and enable **Share system audio** (the wording may be **Also share system audio**). This can include music apps, games, browser tabs and notification sounds routed to the captured system output. Return to Terminal Bloom to watch the graphics.
- For just one browser tab, use the same button, choose the music tab and enable **Share tab audio**. Control playback and volume in the source app/tab. The app analyses audio locally without playing a second copy. Click **Stop shared audio**, **Idle mode**, another input, or the browser's **Stop sharing** control to disconnect.
- PC / tab capture uses the browser's [screen capture permission picker](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getDisplayMedia). The browser requires a video track alongside audio; the app never reads, displays, records or uploads its frames. Audio availability depends on browser/platform and output-device routing; desktop Chrome or Edge on localhost is recommended. Requesting system audio cannot force the browser to provide it. Some protected content cannot be captured. Each new capture needs your selection in the browser picker.
- **PC / tab audio is the primary input.** Click it to choose the playing tab or PC output in the browser picker. Capture needs your click and permission; idle animation runs until connected.
- **Local audio** reveals the optional file picker and player; both start hidden. **Open audio file** selects a local file and starts playback. MP3 and WAV are good starting points; other formats depend on your browser. The file is never uploaded. Play/Pause, position, volume and Loop are inside the same panel. Opening or closing the panel does not switch or stop the active input.
- **Use microphone** asks for browser permission. Select your input in the browser/operating system. The microphone is analysed without speaker monitoring, preventing app-generated feedback. It does not automatically capture other apps' sound; use a microphone near your music, or select a system loopback input if your operating system provides one.
- **Idle mode** pauses the track, releases the microphone and continues quiet mathematical motion. Silence and paused audio also retain baseline animation; the frequency meters correctly settle to zero.
- **Sensitivity** changes audio response, **Motion** changes mathematical animation speed, and **Glyph density** adjusts detail and rendering cost. CRT scanlines and HUD telemetry can be toggled independently.
- **Freeze art** stops geometric motion and audio-dependent deformation; audio playback continues. Resume art restores live response.
- **H** hides/restores the controls without changing the artwork size. **F** enters/exits browser full screen, including when a button or slider has focus. **Space** toggles Freeze art when the artwork/page has focus; on buttons and inputs it keeps the native control behaviour. Shortcuts do not intercept typing or scene selection. Escape leaves full screen, or restores hidden controls in the normal view.
- **Scene** selects one of fourteen distinct graphics. **Next scene** moves through them. Optional **Auto-switch** changes the scene every 30 seconds of visible, unfrozen playback time; it starts off. All scenes use the same live audio input, sensitivity, motion and density controls. Scene changes are immediate cuts.
- The composition fills the same static viewport in every scene, with no social overlays or time limit.

## CRT screen effects

- **Curved CRT glass** enables subtle shader curvature across the glyphs and scanlines, gently rounded corners, a light edge vignette, glass reflection and a phosphor halo. The mapping preserves the viewport boundaries so curvature does not introduce black edge bands or shrink the image. Turn it off for a flat screen.
- **CRT scanlines** has a separate **Scanline intensity** slider, set stronger by default. Four-pixel scanline spacing and a phosphor mask make the texture more visible without blurring the glyphs.
- **Bass degauss** triggers an electromagnetic-style wobble, RGB separation and rainbow magnetic shimmer on large bass onsets. Moving rainbow lobes tint the glyphs and cast a faint iridescent haze, like a magnet affecting a CRT's colour purity. The shimmer lingers briefly as the wobble settles, then fades completely. A moving bass baseline and a 1.4-second cooldown prevent continuous retriggering on sustained bass. Raise **Sensitivity** if your recording is too quiet to trigger it. **Degauss strength** adjusts the combined effect; **Test degauss** previews it without music.
- Degauss is off initially for reduced-motion preferences. Freeze art also freezes its motion. Scanlines and curved glass remain independently adjustable.
- Effects use a local WebGL fragment shader. If WebGL is unavailable, the app retains Canvas art, stronger Canvas scanlines and rounded glass edges, while the degauss controls are disabled. If the GPU context is lost, the Canvas image is shown; refreshing can restore the shader.

## Scene guide

| Scene | Appearance | Music response |
| --- | --- | --- |
| Bloom & hypercube | Original morphing roses, ring lattices, drifting clusters and rotating 4D cube | Bass expands rings; mids deform roses and accelerate cube rotation; treble spreads clusters |
| Hyperspace tunnel | Polygonal glyph rings rushing from a wandering vanishing point | Bass expands rings; mids twist the tunnel |
| Signal terrain | Moving perspective landscape made of sampled glyphs | Bass raises relief; mids add ridges; treble changes glyph texture |
| Glyph rain | Multicolour streams of cascading terminal symbols | Bass lengthens trails; mids shift columns; treble increases symbol turnover |
| Harmonic ribbons | Woven Lissajous curves filling a wide field | Bass widens curves; mids open the weave; treble ripples the ribbons |
| Orbital swarm | A rotating seven-arm galaxy of glyph particles | Bass expands the swarm; mids bend the arms; treble changes particle accents |
| Tron grid | Cyan/orange perspective arena, a neon disc and light-cycle trails | Bass expands the disc; mids extend trails; treble raises light fins |
| Deep space | Outward-moving stars with short warp streaks | Bass stretches streaks; treble changes star glyphs |
| Neon skyline | Layered towers, illuminated windows and a neon orbital sun | Bass shifts building heights; mids expand the sun; treble changes windows |
| Radar sweep | Green phosphor rings and a rotating scanner with target blips | Bass expands targets; mids extend persistence; treble enlarges blips |
| Glyph mandala | Interlocking rotating rings of Japanese glyphs | Bass expands rings; mids deform secondary detail; treble changes symbols |
| Phosphor plasma | Organic interference contours with Korean jamo | Bass shifts the contours; mids reveal layers; treble changes glyph texture |
| Vector scope | Dual harmonic traces and a central Lissajous figure | Bass raises amplitude; mids widen the centre; treble adds harmonic detail; artistic traces rather than a calibrated waveform |
| Circuit board | Right-angle traces, nodes and travelling machine-code glyphs | Bass pulses nodes; mids deflect packets; treble speeds packet travel |

## Colours, glyphs and fonts

Open **Colours & glyphs** below the scene controls. By default **Use each scene’s suggested look** applies a curated palette and alphabet when changing scenes, including during auto-switching. Original scenes remain available with refreshed default looks.

- Eight palettes: Terminal spectrum, Tron cyan/orange, Green phosphor, Amber terminal, Sakura neon, Arctic blue, Solar flare and Ultraviolet.
- Five glyph alphabets: ASCII/geometric, Japanese katakana, Korean Hangul jamo, Cyrillic, and binary/machine code. These are decorative characters, not translated messages. Interface text remains in English.
- Three font styles: Script-friendly mono, Classic console and Typewriter mono. East Asian alphabets use wider cells and script-appropriate system font fallbacks to avoid clipping. No external font downloads; exact letterforms depend on installed fonts.
- Choosing a palette or alphabet disables the suggested-look option so your selection survives scene changes. Re-enable it to restore curated combinations. Font style remains your choice.
- **Shuffle look** chooses a random palette/alphabet combination without changing the scene or audio source.

## Audio response

Web Audio FFT: 4096 samples, analyser smoothing 0.68. Frequency boundaries are computed from the actual AudioContext sample rate, not fixed bin numbers. The RMS of normalised byte-spectrum magnitudes is averaged per band, then sensitivity and time-based attack/release smoothing are applied. These are artistic response values, not calibrated sound-pressure measurements.

| Band | Frequency | Visual response |
| --- | --- | --- |
| Bass | 30–250 Hz | Ring radius and field pulse |
| Mid | 250–2,500 Hz | Rose radius and hypercube rotation/depth |
| Treble | 2,500–16,000 Hz (limited by sample rate) | Glyph turnover and cluster spread |

Audio processing uses the browser's [AnalyserNode](https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode). Microphone use requires localhost or HTTPS and browser permission.

## Performance and accessibility

Canvas glyphs are pre-rendered into a sprite atlas. The app reuses typed cell buffers, caps display pixel ratio at 2, caps rendering around 60 fps, uses elapsed-time motion and skips drawing in background tabs. Actual frame rate depends on hardware, browser, window size and density. Choose Light density or reduce the window size if needed. HUD shows measured rendering FPS. Reduced-motion preference starts the geometry frozen; Resume art opts into animation.

Controls are keyboard accessible, status updates are announced, and the canvas has a text description. Small text inside the artwork is decorative telemetry; controls outside it provide the functional information.

## Troubleshooting

- **PC / tab audio is silent:** for PC audio, choose **Entire screen** and enable **Share system audio**. For tab audio, choose the music **tab** and enable **Share tab audio**. Check that the source is playing through the expected output device, then return to the art tab. The app stops drawing while hidden. If your browser offers no system audio, try current desktop Chrome/Edge on Windows. Alternatively, select a configured Stereo Mix or loopback device through **Use microphone**; availability depends on your sound driver. The app cannot silently listen to other apps without permission.
- **No microphone prompt:** use the localhost address, allow microphone access in the browser's site settings, and check your input device. Idle mode releases the device.
- **File won't play:** try MP3 or WAV. Check browser audio permissions and press Play if automatic playback was blocked.
- **Music plays but response is small:** raise Sensitivity; bass, mids and treble respond separately and depend on the recording.
- **No audible microphone:** intentional; microphone audio is not sent to speakers.
- **Port busy:** stop an earlier copy of the included server, then launch again.

## Verify / edit

No build step. Edit `index.html`, `style.css`, `core.js`, `scenes.js`, `crt.js`, `looks.js` or `app.js`, then refresh. After updating from an earlier version, restart the local server to serve new script files, then refresh the page.

Run `node --test tests/*.test.cjs` for FFT band separation, silence/gain limits, hypercube geometry, scene output, and browser-capture connection/cleanup checks. Capture lifecycle checks use simulated browser streams; actual tab selection and audio availability depend on the browser and require a manual sharing-picker check.
