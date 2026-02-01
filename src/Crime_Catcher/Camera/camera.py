import cv2



class Camera:

    def __init__(self):
        self.cap = cv2.VideoCapture(0)
        if not self.cam_opened():
            raise RuntimeError("Could not open camera.")


    def cam_opened(self) -> bool:
        return self.cap.isOpened()
    

    def activate_cam(self):
        while True:
            ret, frame = self.cap.read()

            if not ret:
                print("Failed to grab frame")
                break

            cv2.imshow("Security Cam", frame)

            if cv2.waitKey(1) & 0xFF == ord('q'):
                break

            if cv2.getWindowProperty("Security Cam", cv2.WND_PROP_VISIBLE)< 1:
                break

        self.cleanup()

    
    def cleanup(self):
        self.cap.release()
        cv2.destroyAllWindows()