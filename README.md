# IOT-project-remote-car

This repository contains the code for my project from the course "Applied IOT - 1DT305".
The project is a robot car controlled remotely through WiFi.

## Tutorial

| **Name**        | **Credentials** | **Date**        | **Estimated time** |
|-----------------|-----------------|-----------------|--------------------|
| Artur Gasparyan |    ag223pe      | 09 August 2022  | 60h               |

This section will explain how to replicate the project as well as elaborate on the system along with the corresponding design decisions. Some sections might be poorly ordered because the tutorial follows a strict template for the assignment, so one might need to skim the content before diving in further.

The end goal of the project is to create a remote robot that can autonomously navigate in an environment given a desired destination.
To this goal, the work up to this point can be seen as a subgoal.
To create a mobile robot, one must first remotely control actuators and sensors over a network.

In this project, a robot car was programmed to communicate with a server over a WiFi connection.
This server then communicates with a website over an additional server, which serves as the interface between human and robot.
From this interface, a user can control the motors of the robot, and see the sensor values, which get broadcasted from the robot to the server.

Due to my inexperience with IoT and embedded systems, this project took a considerable amount of time; roughly 60 hours. Much of this time was spent debugging external libraries which, as it turns out, have some slight incompatibilities with the hardware I selected.
Regardless, the result is mostly functional in the sense that most remaining faults are known limitations within the scope of the project.

### Objective

When given the choice as to which project one should select, one should select the coolest one.
After all, if the self-chosen projects are not cool, which ones will be?
To this end, few areas fulfill the criteria better than the subject of autonomous robots.
The idea of creating a device that can eliminate all forms of labor, mental and physical, can be seen as a holy grail for engineers, as it would be the last problem one would ever need to solve.
Naturally, this project does not solve that problem.
Regardless, the fact remains that autonomous robots are cool, and therefore a good choice for a project.

The purpose of this project is to create a remote-controlled robot, which can then be improved upon in further work.
It is meant to provide a mix of educational moments to learn IoT development, as well as a basis for future projects more tailored toward robotics.

In practice, I believe the project provides the experience needed in order to do hobby projects in the field of mobile robotics.
Because the focus is on learning and gaining knowledge, the goal is therefore not to create a viable product to deploy but to simply gain the practical experience of creating a working system.

### Material

The core of the robot was made using an ESP32-WROVER, due to the low cost, WiFi compatibility, and camera integration.
Along with the board came a plethora of peripherals and accessories, such as a motor driver and an attitude sensor (gyroscope and accelerometer).
All of this was purchased together in a kit called *Freenove Ultimate Starter Kit for ESP32*, which can be found on Amazon using [this](https://www.amazon.se/gp/product/B08FM2NCST/ref=ppx_yo_dt_b_asin_title_o00_s00?ie=UTF8&psc=1) link.

![Various components in the Freenove starter kit displayed on the store page.](tutorial/freenove-kit.jpg)

The components of the car were purchased separately in a robot car kit, found on Kjell & Company using [this](https://www.kjell.com/se/produkter/el-verktyg/arduino/arduino-tillbehor/robotbyggsats-med-hjul-och-motor-p87065) link.

![The package for the car kit found on the store page.](tutorial/car-kit.png)

To connect the motor wire to the GPIO pins on the breadboard, an additional piece of solid-core AWG20 wire was soldered onto each one.
This wire was bought from Electrokit using [this](https://www.electrokit.com/produkt/kopplingstrad-awg20-entradig-svart-m) link.

![Solid core wire as found on the store page](tutorial/solid-core-wire.jpg)

### Computer setup

The setup was divided in three parts, one for each subsystem.

#### Robot

Because the project was done using an ESP32, the choice of platforms was native ESP32, Arduino, and MicroPython.
Since I was somewhat inexperienced with embedded development, I decided to go with the option that had the largest online community, which I determined to be the Arduino platform.

Because I needed to work on the other systems which use different programming languages, I decided to use Visual Studio Code instead of the classical Arduino IDe.
Visual Studio Code has a plugin called PlatformIO which provides many practical tools for embedded development.
Since I had previous experience with C++ and Visual Studio Code, I was fine with the added complexity of PlatformIO for the benefits.

Throughout the project, I ended up installing two additional libraries for the Arduino platform.
The first one was [ArduinoWebsockets by gilmaimon](https://github.com/gilmaimon/ArduinoWebsockets), which allows somewhat smooth communication across a websocket for the ESP32.
The second library was [mpu6050 by ElectroCats](https://github.com/ElectronicCats/mpu6050), which simplifies reading sensor values for the attitude sensor.
Unfortunately, the second library has some slight incompatibilities with the ESP32 device, so I had to manually implement the changes described in [this blog post by Frank](https://www.fpaynter.com/2019/10/mpu6050-fifo-buffer-management-study/) (which I figured out as a result of weeks of debugging).

#### Server

The server is implemented in Python, version 3.10.
It uses the [websockets library by aaugustin](https://pypi.org/project/websockets/), which provides fairly advanced functionality for asynchronous websocket communication.

#### Interface

Frontend communication is done using a classic website, which communicates with the Python server over a websocket.
It is implemented with vanilla JavaScript, though minified using Watchify.
Thus, to develop the frontend, one needs to install:

* Node.js - Requirement for npm

* npm - Package manager

* watchify - To manage proper file management and code management

* Chart.js - Library for displaying charts with JavaScript

### Putting everything together

### Platform

### The code

### Transmitting the data / connectivity

### Presenting the data

### Finalizing the design
