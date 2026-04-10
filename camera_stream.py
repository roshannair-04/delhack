import cv2
import requests
import time
from insightface.app import FaceAnalysis
from app.utils.tracker import CentroidTracker
from app.utils.sound import play_alert

API_URL = "http://127.0.0.1:8000/api/recognize"

face_app = FaceAnalysis(providers=["CPUExecutionProvider"])
face_app.prepare(ctx_id=0, det_size=(320, 320))

tracker = CentroidTracker()

cap = cv2.VideoCapture(0)
cap.set(3, 640)
cap.set(4, 480)

last_sent = {}
identity_map = {}
last_alert_time = {}

INTERVAL = 3  # per face
ALERT_COOLDOWN = 5

print("🎥 Multi-face tracking running...")

while True:
    start = time.time()
    ret, frame = cap.read()
    if not ret:
        break

    faces = face_app.get(frame)

    rects = []
    for face in faces:
        rects.append(face.bbox.astype(int))

    objects = tracker.update(rects)

    for object_id, centroid in objects.items():
        # Match the tracker object to the nearest detected face in this frame
        best_face = None
        min_dist = float('inf')
        for face in faces:
            bx1, by1, bx2, by2 = face.bbox
            bcX, bcY = (bx1+bx2)/2.0, (by1+by2)/2.0
            dist = (bcX - centroid[0])**2 + (bcY - centroid[1])**2
            if dist < min_dist:
                min_dist = dist
                best_face = face
        
        if not best_face:
            continue

        x1, y1, x2, y2 = best_face.bbox.astype(int)
        
        # default label
        label = identity_map.get(object_id, ("RED", "Unknown", 0.0))
        status, identity, conf = label
        conf = round(conf, 2)

        color = (0, 255, 0) if status == "GREEN" else \
                (0, 255, 255) if status == "YELLOW" else \
                (0, 0, 255)

        cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
        
        cv2.rectangle(frame, (x1, y1-25), (x1+250, y1), color, -1)

        cv2.putText(frame,
                    f"ID {object_id} | {status} | {identity} | {conf}",
                    (x1, y1 - 10),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)

        # 🔥 API CALL PER FACE (throttled)
        if object_id not in last_sent or time.time() - last_sent[object_id] > INTERVAL:
            last_sent[object_id] = time.time()
            try:
                res = requests.post(
                    "http://127.0.0.1:8000/api/recognize_embedding", 
                    json={"embedding": best_face.embedding.tolist()}, 
                    timeout=1
                )

                if res.status_code == 200:
                    data = res.json()

                    if object_id not in identity_map or data.get("confidence", 0) > 0.5:
                        identity_map[object_id] = (
                            data["status"],
                            data.get("identity", "Unknown"),
                            data.get("confidence", 0.0)
                        )

                    if data["status"] == "RED":
                        if object_id not in last_alert_time or time.time() - last_alert_time[object_id] > ALERT_COOLDOWN:
                            play_alert("RED")
                            last_alert_time[object_id] = time.time()

                    print(f"ID {object_id} →", data)

            except:
                pass

    fps = 1 / (time.time() - start)
    cv2.putText(frame, f"FPS: {int(fps)}",
                (10, 30),
                cv2.FONT_HERSHEY_SIMPLEX, 0.7,
                (255, 255, 255), 2)

    cv2.imshow("UWSD Multi-Face Tracking", frame)

    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

cap.release()
cv2.destroyAllWindows()