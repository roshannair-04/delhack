import easyocr

reader = easyocr.Reader(['en'])

def detect_plate(image):
    results = reader.readtext(image)

    for (_, text, prob) in results:
        if prob > 0.5:
            return text

    return None
