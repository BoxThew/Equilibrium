import cv2
from flask import Flask, Response, jsonify
from flask_cors import CORS

# If you want to use your video detection, uncomment these:
# from video_integrated import Camera
# Or if using the original structure:
# from video import Camera

app = Flask(__name__)
CORS(app)

# Simple version without the Camera class - just streams webcam
def generate_frames():
    """Generate frames from webcam for video streaming"""
    camera = cv2.VideoCapture(0)
    
    while True:
        success, frame = camera.read()
        if not success:
            break
        
        # Encode frame as JPEG
        ret, buffer = cv2.imencode('.jpg', frame)
        frame_bytes = buffer.tobytes()
        
        # Yield frame in multipart format
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
    
    camera.release()


@app.route('/video_feed')
def video_feed():
    """Video streaming route"""
    return Response(generate_frames(),
                    mimetype='multipart/x-mixed-replace; boundary=frame')


@app.route('/api/status')
def get_status():
    """Return current detection status"""
    # For now, return a dummy status
    # You can integrate with your detection system later
    return jsonify({
        "status": "SECURE",
        "lastAlert": None
    })


if __name__ == '__main__':
    print("Starting Flask Server on http://127.0.0.1:5001")
    print("Video feed available at: http://127.0.0.1:5001/video_feed")
    app.run(debug=True, port=5001, host='0.0.0.0')
