import numpy as np
from insightface.app import FaceAnalysis

app = FaceAnalysis(
    name="buffalo_l",
    providers=["CPUExecutionProvider"]
)

app.prepare(ctx_id=0, det_size=(640, 640))


def get_face_embedding(image: np.ndarray):
    faces = app.get(image)

    if not faces:
        return None

    face = max(faces, key=lambda f: (f.bbox[2]-f.bbox[0]) * (f.bbox[3]-f.bbox[1]))

    return {
        "embedding": face.embedding.tolist(),
        "bbox": face.bbox.astype(int).tolist()
    }