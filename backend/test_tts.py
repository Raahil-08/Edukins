from TTS.api import TTS

# Initialize the model
tts = TTS(model_name="tts_models/en/vctk/vits", progress_bar=False, gpu=False)

# Pick one speaker (e.g., 'p273', 'p240', etc.)
tts.tts_to_file(
    text="Hello, this is Coqui speaking.",
    file_path="output.wav",
    speaker="p273"  # <- use any name from tts.speakers
)
