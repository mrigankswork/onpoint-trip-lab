"""Synthesizes public/music.mp3: an original 60-second, 120 BPM bed for the film.
120 BPM puts a beat on every half second, so every scene change in the storyboard lands on a beat.
Nothing is sampled, so there is no licence to clear.  Usage: python3 audio/music.py  (needs numpy and ffmpeg)
"""
import subprocess, wave
import numpy as np

SR, DUR, BEAT = 44100, 60.0, 0.5
N = int(SR * DUR)
t = np.arange(N) / SR
rng = np.random.default_rng(7)
L = np.zeros(N); R = np.zeros(N)

def hz(m): return 440.0 * 2 ** ((m - 69) / 12)

def add(buf, start, sig, gain=1.0):
    i = int(start * SR)
    if i >= N: return
    sig = sig[: N - i]
    buf[i:i + len(sig)] += sig * gain

def env(n, a, d):  # attack then exponential decay, in seconds
    x = np.arange(n) / SR
    return np.minimum(1, x / max(a, 1e-4)) * np.exp(-np.maximum(0, x - a) / d)

def lowpass(x, k):  # one-pole, k in 0..1
    y = np.empty_like(x); acc = 0.0
    for i in range(len(x)):
        acc += k * (x[i] - acc); y[i] = acc
    return y

# Four-bar loop, one chord per 2-second bar: Fmaj7, G6, Am7, Cmaj7 (bright, forward-moving).
CHORDS = [[53, 57, 60, 64], [55, 59, 62, 64], [57, 60, 64, 67], [60, 64, 67, 71]]
ROOTS = [41, 43, 45, 48]
BARS = int(DUR / 2)

# Sections, in seconds, cut to the storyboard.
DRUMS_IN, FULL_IN, BREAK, DROP, OUTRO = 5.0, 10.0, 45.0, 47.0, 57.0

# ---- kick, and the pump it drives ----
kn = int(0.32 * SR); kx = np.arange(kn) / SR
kick = np.sin(2 * np.pi * (48 * kx + (150 - 48) * 0.035 * (1 - np.exp(-kx / 0.035)))) * np.exp(-kx / 0.11)
pump = np.ones(N)
beats = np.arange(DRUMS_IN, OUTRO, BEAT)
for b in beats:
    if BREAK <= b < DROP: continue
    add(L, b, kick, 0.85); add(R, b, kick, 0.85)
    i = int(b * SR); n = int(0.36 * SR)
    pump[i:i + n] = np.minimum(pump[i:i + n], 0.35 + 0.65 * (np.arange(n) / n) ** 0.7)

# ---- pad: detuned soft saws through a low-pass, slow attack ----
pad_l = np.zeros(N); pad_r = np.zeros(N)
for bar in range(BARS):
    n = int(2.15 * SR); x = np.arange(n) / SR
    e = np.minimum(1, x / 0.25) * np.minimum(1, (2.15 - x) / 0.3)
    for m in CHORDS[bar % 4]:
        for det, buf in ((-0.06, pad_l), (0.07, pad_r)):
            f = hz(m + det)
            s = sum(np.sin(2 * np.pi * f * h * x) / h for h in range(1, 7))
            add(buf, bar * 2.0, s * e, 0.05)
pad_l = lowpass(pad_l, 0.12); pad_r = lowpass(pad_r, 0.12)
L += pad_l * pump * 1.6; R += pad_r * pump * 1.6

# ---- pluck arpeggio on eighth notes, panned side to side ----
ARP = [0, 2, 1, 3, 2, 1, 3, 2]
for bar in range(BARS):
    for s in range(8):
        at = bar * 2.0 + s * 0.25
        if at < FULL_IN or at >= OUTRO or BREAK <= at < DROP: continue
        m = CHORDS[bar % 4][ARP[s]] + 12
        n = int(0.4 * SR); x = np.arange(n) / SR
        sig = (np.sin(2 * np.pi * hz(m) * x) + 0.35 * np.sin(4 * np.pi * hz(m) * x)) * env(n, 0.004, 0.09)
        pan = 0.5 + 0.35 * np.sin(s * 1.3 + bar)
        g = 0.16 if at >= DROP else 0.12
        add(L, at, sig, g * (1 - pan)); add(R, at, sig, g * pan)

# ---- bass on the off-beats ----
for bar in range(BARS):
    for s in range(4):
        at = bar * 2.0 + s * BEAT + 0.25
        if at < FULL_IN or at >= OUTRO or BREAK <= at < DROP: continue
        f = hz(ROOTS[bar % 4]); n = int(0.24 * SR); x = np.arange(n) / SR
        sig = (np.sin(2 * np.pi * f * x) + 0.4 * np.sin(4 * np.pi * f * x)) * env(n, 0.006, 0.12)
        add(L, at, sig, 0.42); add(R, at, sig, 0.42)

# ---- hats on the off-beats, clap on beats two and four ----
def noise(n): return rng.standard_normal(n)
for b in np.arange(FULL_IN, OUTRO, BEAT):
    if BREAK <= b < DROP: continue
    n = int(0.06 * SR); h = noise(n); h = h - lowpass(h, 0.5)
    add(L, b + 0.25, h * env(n, 0.001, 0.014), 0.10); add(R, b + 0.25, h * env(n, 0.001, 0.014), 0.12)
for b in np.arange(14.0, OUTRO, BEAT):
    if BREAK <= b < DROP or int(round(b / BEAT)) % 2 == 0: continue
    n = int(0.16 * SR); c = lowpass(noise(n), 0.35) - lowpass(noise(n), 0.04)
    add(L, b, c * env(n, 0.002, 0.045), 0.20); add(R, b, c * env(n, 0.002, 0.045), 0.20)

# ---- riser into the unlock scene, and a final chord under the end card ----
n = int(2.0 * SR); x = np.arange(n) / n
ris = noise(n); ris = ris - lowpass(ris, 0.25)
add(L, BREAK, ris * x ** 2, 0.10); add(R, BREAK, ris * x ** 2, 0.10)
n = int(3.0 * SR); x = np.arange(n) / SR
for m in [48, 55, 60, 64, 67, 72]:
    s = (np.sin(2 * np.pi * hz(m) * x) + 0.3 * np.sin(4 * np.pi * hz(m) * x)) * env(n, 0.01, 0.9)
    add(L, OUTRO, s, 0.11); add(R, OUTRO, s, 0.11)

# ---- master: fades, soft clip, normalise ----
fade = np.minimum(1, t / 0.6) * np.minimum(1, (DUR - t) / 1.6)
mix = np.stack([L, R], axis=1) * fade[:, None]
mix = np.tanh(mix * 1.4)
mix = mix / np.max(np.abs(mix)) * 0.89
with wave.open('audio/music.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((mix * 32767).astype('<i2').tobytes())
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', 'audio/music.wav', '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11', '-ar', '48000', '-b:a', '192k', 'public/music.mp3'], check=True)
print('wrote public/music.mp3')
