import { Road } from './Road.js';
import { Intersection } from './Intersection.js';
import { Vehicle } from './Vehicle.js';
import { ROAD_WIDTH, LANE_WIDTH, VEHICLE_LENGTH, VEHICLE_WIDTH, LIGHT_TIMINGS } from './constants.js';

export class TrafficSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.road = new Road(canvas);
        this.intersection = new Intersection(canvas.width/2, canvas.height/2);
        this.vehicles = [];
        this.spawnTimer = 0;
        this.spawnInterval = 60; // Spawn a new vehicle every 60 frames
        
        // Initialize debug controls
        this.initializeDebugControls();
    }

    initializeDebugControls() {
        // Get debug panel elements
        this.greenDurationInput = document.getElementById('greenDuration');
        this.yellowDurationInput = document.getElementById('yellowDuration');
        this.greenValueDisplay = document.getElementById('greenValue');
        this.yellowValueDisplay = document.getElementById('yellowValue');
        this.redValueDisplay = document.getElementById('redValue');
        this.nsStateDisplay = document.getElementById('nsState');
        this.ewStateDisplay = document.getElementById('ewState');

        // Initialize values
        this.greenDurationInput.value = LIGHT_TIMINGS.green;
        this.yellowDurationInput.value = LIGHT_TIMINGS.yellow;
        this.updateDisplayValues();

        // Add event listeners
        this.greenDurationInput.addEventListener('input', () => {
            LIGHT_TIMINGS.green = parseInt(this.greenDurationInput.value);
            this.updateDisplayValues();
        });

        this.yellowDurationInput.addEventListener('input', () => {
            LIGHT_TIMINGS.yellow = parseInt(this.yellowDurationInput.value);
            this.updateDisplayValues();
        });
    }

    updateDisplayValues() {
        this.greenValueDisplay.textContent = LIGHT_TIMINGS.green;
        this.yellowValueDisplay.textContent = LIGHT_TIMINGS.yellow;
        this.redValueDisplay.textContent = LIGHT_TIMINGS.green + LIGHT_TIMINGS.yellow;
        
        // Update current states
        this.nsStateDisplay.textContent = this.intersection.northLight.state;
        this.ewStateDisplay.textContent = this.intersection.eastLight.state;
    }

    update() {
        this.intersection.update();
        this.updateVehicles();
        this.spawnVehicles();
        this.updateDisplayValues();
    }

    updateVehicles() {
        for (let i = this.vehicles.length - 1; i >= 0; i--) {
            const vehicle = this.vehicles[i];
            
            // Get the relevant traffic light for this vehicle
            const trafficLight = this.getRelevantTrafficLight(vehicle);
            
            // Update vehicle state based on traffic light and other vehicles
            const shouldStop = vehicle.shouldStop(
                trafficLight,
                this.vehicles,
                this.intersection.x,
                this.intersection.y
            );

            // Update vehicle position if not stopped
            if (!shouldStop) {
                vehicle.move();
            }

            // Remove vehicles that are off screen
            if (this.isOffScreen(vehicle)) {
                this.vehicles.splice(i, 1);
            }
        }
    }

    getRelevantTrafficLight(vehicle) {
        // Get the light that controls this vehicle's direction
        switch(vehicle.direction) {
            case 'north':
                return this.intersection.northLight;
            case 'south':
                return this.intersection.southLight;
            case 'east':
                return this.intersection.eastLight;
            case 'west':
                return this.intersection.westLight;
        }
    }

    spawnVehicles() {
        this.spawnTimer++;
        if (this.spawnTimer >= this.spawnInterval) {
            this.spawnTimer = 0;
            
            const direction = this.getRandomDirection();
            const position = this.getSpawnPosition(direction);
            
            // Check if spawn position is clear
            if (!this.isSpawnBlocked(position.x, position.y, direction)) {
                this.vehicles.push(new Vehicle(position.x, position.y, direction));
            }
        }
    }

    getRandomDirection() {
        const directions = ['north', 'south', 'east', 'west'];
        return directions[Math.floor(Math.random() * directions.length)];
    }

    getSpawnPosition(direction) {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        // Position vehicles BETWEEN lane markers
        const lanes = {
            north: [
                centerX + LANE_WIDTH * 1.5,  // Rightmost lane (between markers)
                centerX + LANE_WIDTH * 0.5   // Second from right (between markers)
            ],
            south: [
                centerX - LANE_WIDTH * 1.5,  // Rightmost lane (between markers)
                centerX - LANE_WIDTH * 0.5   // Second from right (between markers)
            ],
            east: [
                centerY + LANE_WIDTH * 1.5,  // Rightmost lane (between markers)
                centerY + LANE_WIDTH * 0.5   // Second from right (between markers)
            ],
            west: [
                centerY - LANE_WIDTH * 1.5,  // Rightmost lane (between markers)
                centerY - LANE_WIDTH * 0.5   // Second from right (between markers)
            ]
        };

        // Randomly choose between the two lanes
        const laneIndex = Math.floor(Math.random() * 2);
        const lanePosition = lanes[direction][laneIndex];

        switch(direction) {
            case 'north':
                return {
                    x: lanePosition - VEHICLE_WIDTH / 2,
                    y: this.canvas.height
                };
            case 'south':
                return {
                    x: lanePosition - VEHICLE_WIDTH / 2,
                    y: -VEHICLE_LENGTH
                };
            case 'east':
                return {
                    x: -VEHICLE_LENGTH,
                    y: lanePosition - VEHICLE_WIDTH / 2
                };
            case 'west':
                return {
                    x: this.canvas.width,
                    y: lanePosition - VEHICLE_WIDTH / 2
                };
        }
    }

    isSpawnBlocked(x, y, direction) {
        const spawnBuffer = VEHICLE_LENGTH * 2;
        
        for (const vehicle of this.vehicles) {
            if (vehicle.direction !== direction) continue;
            
            const distance = this.getDistanceBetweenPoints(
                x + VEHICLE_WIDTH/2,
                y + VEHICLE_LENGTH/2,
                vehicle.x + VEHICLE_WIDTH/2,
                vehicle.y + VEHICLE_LENGTH/2
            );
            
            if (distance < spawnBuffer) return true;
        }
        return false;
    }

    getDistanceBetweenPoints(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    }

    isOffScreen(vehicle) {
        return (
            vehicle.x < -VEHICLE_LENGTH ||
            vehicle.x > this.canvas.width + VEHICLE_LENGTH ||
            vehicle.y < -VEHICLE_LENGTH ||
            vehicle.y > this.canvas.height + VEHICLE_LENGTH
        );
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#228B22';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw road and intersection
        this.road.drawRoad();
        this.intersection.draw(this.ctx);

        // Draw vehicles
        for (const vehicle of this.vehicles) {
            vehicle.draw(this.ctx);
        }
    }
}
