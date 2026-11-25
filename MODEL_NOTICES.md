# Gemini leaf diagnosis

The app sends leaf photos and optional observations to the AgriGuard server, which
calls Google's multimodal `gemini-3.5-flash-lite` model. The API key is stored on
the server as `GEMINI_API_KEY`; it is not included in the frontend bundle.
Supported crop choices are tomato, corn, potato, rice, wheat, apple, and grape,
with automatic crop detection available.

Gemini's self-reported score is an uncalibrated estimate, not a probability.
The model may misidentify crops or symptoms; generated results and care
suggestions are screening guidance, not a confirmed diagnosis. The prompt asks
for visible signs and conservative, non-chemical care only. Confirm disease and
treatment decisions with a local agricultural expert.

## Healthy reference images

The comparison panel uses separate healthy corn and potato leaf images from the
[Plant Village dataset](https://huggingface.co/datasets/DScomp380/plant_village).
The dataset metadata declares CC0-1.0. The corn image is row `10412` and the
potato image is row `28274`. Images are stored locally in `public/`; other crops
show an unavailable-reference message until a matching image is added.
