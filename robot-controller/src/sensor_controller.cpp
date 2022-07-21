#include <Arduino.h>
#include "esp_camera.h"
#include "camera_pins.h"
#include "sensor_controller.h"
#include "I2Cdev.h"
#include "MPU6050_6Axis_MotionApps20.h"

static const camera_config_t config{
    .pin_pwdn = PWDN_GPIO_NUM,
    .pin_reset = RESET_GPIO_NUM,
    .pin_xclk = XCLK_GPIO_NUM,
    .pin_sscb_sda = SIOD_GPIO_NUM,
    .pin_sscb_scl = SIOC_GPIO_NUM,
    .pin_d7 = Y9_GPIO_NUM,
    .pin_d6 = Y8_GPIO_NUM,
    .pin_d5 = Y7_GPIO_NUM,
    .pin_d4 = Y6_GPIO_NUM,
    .pin_d3 = Y5_GPIO_NUM,
    .pin_d2 = Y4_GPIO_NUM,
    .pin_d1 = Y3_GPIO_NUM,
    .pin_d0 = Y2_GPIO_NUM,
    .pin_vsync = VSYNC_GPIO_NUM,
    .pin_href = HREF_GPIO_NUM,
    .pin_pclk = PCLK_GPIO_NUM,
    .xclk_freq_hz = 20000000,
    .ledc_timer = LEDC_TIMER_0,
    .ledc_channel = LEDC_CHANNEL_0,
    .pixel_format = PIXFORMAT_JPEG,
    .frame_size = FRAMESIZE_UXGA,
    .jpeg_quality = 10,
    .fb_count = 2,
    .fb_location = CAMERA_FB_IN_PSRAM,
    .grab_mode = CAMERA_GRAB_LATEST,
};

void startSensorController()
{
    /*
    Serial.println("Initiating sensor controller...");

    esp_err_t configStatus = esp_camera_init(&config);
    if (configStatus != ESP_OK)
    {
        Serial.printf("Camera setup failed with error 0x%x\n", configStatus);
        return;
    }

    sensor_t *cameraSensor = esp_camera_sensor_get();
    cameraSensor->set_framesize(cameraSensor, config.frame_size);
    cameraSensor->set_pixformat(cameraSensor, config.pixel_format);
    cameraSensor->set_quality(cameraSensor, config.jpeg_quality);

    Serial.println("Sensor controller initiated");
    */


    SensorController::AttitudeController::setup();
}

namespace SensorController
{
    namespace AttitudeController
    {
        const uint8_t I2C_ADDRESS{0x68};
        const uint8_t FIFO_SIZE{64};
        const uint32_t CLOCK_FREQ{20000};

        namespace Status
        {
            bool isDmpReady{false};
            uint8_t intStatus, devStatus;
            uint16_t packetSize, fifoCount;
            uint8_t fifoBuffer[FIFO_SIZE];

            volatile bool isInterruptDown{false};
        }

        namespace Pins
        {
            const uint8_t SCL = 22;
            const uint8_t SDA = 21;
            const uint8_t INT = 15;
        }

        MPU6050 mpuDevice{I2C_ADDRESS};

        namespace Measurement
        {
            float rotEulerRadMeasure[3];
            Quaternion rotQuatMeasure;
            VectorInt16 accelMeasure;
            VectorInt16 realAccelMeasure;
            VectorInt16 worldAccelMeasure;
            VectorFloat gravityVec;

            void updateMeasurements()
            {
                mpuDevice.dmpGetQuaternion(&rotQuatMeasure, Status::fifoBuffer);
                mpuDevice.dmpGetEuler(rotEulerRadMeasure, &rotQuatMeasure);
                mpuDevice.dmpGetAccel(&accelMeasure, Status::fifoBuffer);
                mpuDevice.dmpGetGravity(&gravityVec, &rotQuatMeasure);
                mpuDevice.dmpGetLinearAccel(&realAccelMeasure, &accelMeasure, &gravityVec);
                mpuDevice.dmpGetLinearAccelInWorld(&worldAccelMeasure, &realAccelMeasure, &rotQuatMeasure);
            }

            inline void displayVector(const String &label, const float array[3])
            {
                Serial.printf("%s: (%f, %f, %f)", label.c_str(), array[0], array[1], array[2]);
            }

            inline void displayVector(const String &label, const VectorFloat vector)
            {
                Serial.printf("%s: (%f, %f, %f)", label.c_str(), vector.x, vector.y, vector.z);
            }

            inline void displayVector(const String &label, const VectorInt16 vector)
            {
                Serial.printf("%s: (%hd, %hd, %hd)", label.c_str(), vector.x, vector.y, vector.z);
            }

            inline void displayVector(const String &label, const Quaternion vector)
            {
                Serial.printf("%s: (%f, %f, %f, %f)", label.c_str(), vector.x, vector.y, vector.z, vector.w);
            }
        }

        void ICACHE_RAM_ATTR dmpDataReady()
        {
            Status::isInterruptDown = true;
        }

        void setup()
        {
            Serial.println("Initializing attitude sensor...");

            //Wire.begin(0x68u, Pins::SDA, Pins::SCL);
            Wire.begin();
            Wire.setClock(CLOCK_FREQ);

            Serial.println("Initializing MPU6050...");
            mpuDevice.initialize();
            Serial.println("Finished initializing MPU6050.");

            pinMode(Pins::INT, INPUT);

            Serial.println("Testing device connections...");
            if (!mpuDevice.testConnection())
            {
                Serial.println("MPU6050 connection failed");
                return;
            }
            Serial.println("MPU6050 connection successful");

            Serial.println("Initializing DMP...");
            Status::devStatus = mpuDevice.dmpInitialize();

            if (Status::devStatus != 0)
            {
                Serial.printf("DMP initialization failed (code %d)", Status::devStatus);
                return;
            }

            Serial.println("Enabling DMP...");
            mpuDevice.setDMPEnabled(true);

            Serial.println("Enabling interrupt detection...");
            attachInterrupt(digitalPinToInterrupt(Pins::INT), dmpDataReady, RISING);
            Status::intStatus = mpuDevice.getIntStatus();

            Serial.println("DMP ready! Waiting for first interrupt...");
            Status::isDmpReady = true;
            Status::packetSize = mpuDevice.dmpGetFIFOPacketSize();
        }

        void tick()
        {
            if ((!Status::isDmpReady) || (!Status::isInterruptDown && Status::fifoCount << Status::packetSize))
                return;

            Status::isInterruptDown = false;
            Status::intStatus = mpuDevice.getIntStatus();
            Status::fifoCount = mpuDevice.getFIFOCount();

            if ((Status::intStatus & 0x10) || (Status::fifoCount == 1 << 10))
            {
                mpuDevice.resetFIFO();
                Serial.println("FIFO Overflow");
                return;
            }

            if (!(Status::intStatus & 0x02))
                return;

            while (Status::fifoCount < Status::packetSize)
                Status::fifoCount = mpuDevice.getFIFOCount();

            mpuDevice.getFIFOBytes(Status::fifoBuffer, Status::packetSize);
            Status::fifoCount -= Status::packetSize;

            Measurement::updateMeasurements();
            Measurement::displayVector("radmeasurement", Measurement::rotEulerRadMeasure);
        }

    }

}
