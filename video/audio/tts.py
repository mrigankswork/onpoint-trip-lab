"""Voice lines for the film, generated locally with Kokoro TTS (open source).
  audio/.venv/bin/python audio/tts.py samples          line 1 in three voices -> public/vo/samples/
  audio/.venv/bin/python audio/tts.py all <voice>      every line -> public/vo/01.wav ... 10.wav
Model files live in audio/models (see video/README.md for the download links).
"""
import json, sys
import soundfile as sf
from kokoro_onnx import Kokoro

# Start second, the line, and the second its scene ends. From VIDEO_SCRIPT.md section 4.
LINES = [
    (0, "Riya earns rewards on almost everything she buys. But her trip is seventeen months away.", 10, "Intro, then the app today"),
    (10, "Same spend. New Onpoint.", 14, "The flip"),
    (14, "She picks the trip first: Kasol, with her friends.", 22, "Onboarding"),
    (22, "Now she sees progress in rupees. And Drops, funded by brands, double what she earns.", 29, "Home and Drops"),
    (29, "One order, two hundred rupees closer.", 36, "Checkout"),
    (36, "Tracked live, at one rupee a point.", 41, "Tracking"),
    (41, "Her friends join. The goal becomes the group's.", 47, "Squad"),
    (47, "Her stay unlocks in just over three months, not seventeen.", 53, "Unlock"),
    (53, "And it's worth sharing.", 57, "Wrapped"),
    (57, "Onpoint. Your next weekend starts here.", 60, "End card"),
]
SAMPLE_VOICES = [("af_heart", "en-us"), ("af_bella", "en-us"), ("bf_emma", "en-gb")]
GAP = 0.3  # each line must end this long before its scene does

kokoro = Kokoro("audio/models/kokoro-v1.0.onnx", "audio/models/voices-v1.0.bin")

def speak(text, voice, lang, speed, path):
    samples, sr = kokoro.create(text, voice=voice, speed=speed, lang=lang)
    sf.write(path, samples, sr)
    return len(samples) / sr

if sys.argv[1] == "samples":
    for voice, lang in SAMPLE_VOICES:
        d = speak(LINES[0][1], voice, lang, 1.0, f"public/vo/samples/{voice}.wav")
        print(f"{voice}: {d:.2f}s")
else:
    voice = sys.argv[2]
    lang = "en-gb" if voice.startswith("b") else "en-us"
    report = []
    for i, (at, text, end, scene) in enumerate(LINES, 1):
        room = end - at - GAP
        speed = 1.0
        d = speak(text, voice, lang, speed, f"public/vo/{i:02d}.wav")
        if d > room:  # try once more, a little faster, never above 1.1x
            speed = min(1.1, round(d / room + 0.01, 2))
            d = speak(text, voice, lang, speed, f"public/vo/{i:02d}.wav")
        report.append({"n": i, "start": at, "length": round(d, 2), "ends": round(at + d, 2), "sceneEnds": end, "speed": speed, "fits": d <= room, "scene": scene, "text": text})
        print(f"{i:02d}  {at:>2}s  {d:.2f}s  ends {at + d:5.2f}  scene ends {end}  x{speed}  {'ok' if d <= room else 'TOO LONG'}  {scene}")
    # The film reads this for where each line sits and how long the music stays ducked.
    json.dump({"voice": voice, "lines": report}, open("src/voLines.json", "w"), indent=2)
