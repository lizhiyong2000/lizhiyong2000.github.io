

```python
import cv2
import imutils
import numpy as np
import pytesseract
from PIL import Image
img = cv2.imread('4.jpg',cv2.IMREAD_COLOR)
img = cv2.resize(img, (620,480) )
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY) #convert to grey scale
gray = cv2.bilateralFilter(gray, 11, 17, 17) #Blur to reduce noise
edged = cv2.Canny(gray, 30, 200) #Perform Edge detection
# find contours in the edged image, keep only the largest
# ones, and initialize our screen contour
cnts = cv2.findContours(edged.copy(), cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
cnts = imutils.grab_contours(cnts)
cnts = sorted(cnts, key = cv2.contourArea, reverse = True)[:10]
screenCnt = None
# loop over our contours
for c in cnts:
 # approximate the contour
 peri = cv2.arcLength(c, True)
 approx = cv2.approxPolyDP(c, 0.018 * peri, True)

 # if our approximated contour has four points, then
 # we can assume that we have found our screen
 if len(approx) == 4:
  screenCnt = approx
  break

if screenCnt is None:
 detected = 0
 print "No contour detected"
else:
 detected = 1
if detected == 1:
 cv2.drawContours(img, [screenCnt], -1, (0, 255, 0), 3)
# Masking the part other than the number plate
mask = np.zeros(gray.shape,np.uint8)
new_image = cv2.drawContours(mask,[screenCnt],0,255,-1,)
new_image = cv2.bitwise_and(img,img,mask=mask)
# Now crop
(x, y) = np.where(mask == 255)
(topx, topy) = (np.min(x), np.min(y))
(bottomx, bottomy) = (np.max(x), np.max(y))
Cropped = gray[topx:bottomx+1, topy:bottomy+1]

#Read the number plate
text = pytesseract.image_to_string(Cropped, config='--psm 11')
print("Detected Number is:",text)
cv2.imshow('image',img)
cv2.imshow('Cropped',Cropped)
cv2.waitKey(0)
cv2.destroyAllWindows()
```





+ [License plate detection with OpenCV and Python](https://cvisiondemy.com/license-plate-detection-with-opencv-and-python/)
+ [Character recognition: OCR on license plates](http://cvisiondemy.com/character-recognition-alpr-ocr-case/)
+ [License Plate Recognition using Raspberry Pi and OpenCV](https://circuitdigest.com/microcontroller-projects/license-plate-recognition-using-raspberry-pi-and-opencv)
+ [openalpr](https://github.com/openalpr/openalpr)
+ [Automatic License Plate Detection & Recognition using deep learning](https://towardsdatascience.com/automatic-license-plate-detection-recognition-using-deep-learning-624def07eaaf)
+ [车辆检测（YOLOV2)](https://github.com/yang1688899/Vehicle-Detection-YOLO-keras)
+ [License Plate Detection and Recognition in Unconstrained Scenarios](https://github.com/sergiomsilva/alpr-unconstrained)
