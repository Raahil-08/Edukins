import sys
from TTS.api import TTS

# Args
speaker = sys.argv[1]
text = sys.argv[2]
out_path = sys.argv[3]

# Load model once
tts = TTS(model_name="tts_models/en/vctk/vits", progress_bar=False, gpu=False)

# Generate audio file with speaker voice
tts.tts_to_file(text=text, speaker=speaker, file_path=out_path)

