import cv2

# Open default webcam (0)
cap = cv2.VideoCapture(0)

# Optional: set resolution
cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)

if not cap.isOpened():
    raise RuntimeError("Could not open webcam")

while True:
    ret, frame = cap.read()
    if not ret:
        print("Failed to grab frame")
        break

    # frame is a NumPy array (H x W x 3), BGR format
    cv2.imshow("Security Cam", frame)

    # Exit on 'q'
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

    if cv2.getWindowProperty("Security Cam", cv2.WND_PROP_VISIBLE) < 1:
        break
# Cleanup
cap.release()
cv2.destroyAllWindows()
