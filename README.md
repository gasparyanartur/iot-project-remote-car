# IOT-project-remote-car

This repository contains the code for my project from the course "Applied IOT - 1DT305".
The project is a robot car controlled remotely through WiFi.

## Tutorial

| **Name**        | **Credentials** | **Date**        | **Estimated time** |
|-----------------|-----------------|-----------------|--------------------|
| Artur Gasparyan |    ag223pe      | 09 August 2022  | 60h               |

This section will explain how to replicate the project as well as elaborate on the system along with the corresponding design decisions.

The end goal of the project is to create a remote robot that can autonomously navigate in an environment given a desired destination.
To this goal, the work up to this point can be seen as a subgoal.
To create a mobile robot, one must first remotely control actuators and sensors over a network.

In this project, a robot car was programmed to communicate with a server over a WiFi-connection.
This server then communicates with a website over an additional server, which serves as the interface between human and robot.
From this interface, a user can control the motors of the robot, and see the sensor values, which get broadcasted from the robot to the server.

Due to my inexperience with IOT and embedded systems, this project took a considerable amount of time; roughly 60 hours. Much of this time was spent debugging external libraries which, as it turns out, have some slight incompatibilities with the hardware I selected.
Regardless, the result is mostly functional in the sense that most remaining faults are known limitations within the scope of the project.

### Objective

### Material

### Computer setup

### Putting everything together

### Platform

### The code

### Transmitting the data / connectivity

### Presenting the data

### Finalizing the design
