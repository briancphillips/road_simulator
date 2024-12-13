import { VEHICLE_LENGTH, VEHICLE_WIDTH, SAFE_DISTANCE, INTERSECTION_BUFFER, 
         INTERSECTION_MARGIN, MIN_EXIT_SPACE, ROAD_WIDTH, VEHICLE_SPEED,
         STOP_LINE_OFFSET } from './constants.js';

export class Vehicle {
    constructor(x, y, direction) {
        this.x = x;
        this.y = y;
        this.direction = direction; // 'north', 'south', 'east', 'west'
        this.speed = VEHICLE_SPEED;
        this.width = VEHICLE_WIDTH;
        this.length = VEHICLE_LENGTH;
        this.color = this.getRandomColor();
        this.waiting = false;
        this.waitTime = 0;
        this.inIntersection = false;
        this.crossingOnYellow = false;
    }

    getRandomColor() {
        const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    getCenter() {
        const isHorizontal = this.direction === 'east' || this.direction === 'west';
        const displayWidth = isHorizontal ? this.length : this.width;
        const displayHeight = isHorizontal ? this.width : this.length;
        
        return {
            x: this.x + displayWidth / 2,
            y: this.y + displayHeight / 2
        };
    }

    getFront() {
        switch(this.direction) {
            case 'north': return this.y;
            case 'south': return this.y + this.length;
            case 'east': return this.x + this.width;
            case 'west': return this.x;
        }
    }

    isInIntersection(intersectionX, intersectionY) {
        const center = this.getCenter();
        const margin = INTERSECTION_MARGIN;
        return Math.abs(center.x - intersectionX) < margin && 
               Math.abs(center.y - intersectionY) < margin;
    }

    isApproachingIntersection(intersectionX, intersectionY) {
        const approachDistance = ROAD_WIDTH * 1.5;
        const front = this.getFront();
        
        switch(this.direction) {
            case 'north':
                return this.y > intersectionY && 
                       this.y < intersectionY + approachDistance;
            case 'south':
                return this.y < intersectionY && 
                       this.y > intersectionY - approachDistance;
            case 'east':
                return this.x < intersectionX && 
                       this.x > intersectionX - approachDistance;
            case 'west':
                return this.x > intersectionX && 
                       this.x < intersectionX + approachDistance;
        }
    }

    getDistanceToStopLine(intersectionX, intersectionY) {
        const stopLineDistance = ROAD_WIDTH/2 + STOP_LINE_OFFSET;
        
        switch(this.direction) {
            case 'north':
                return this.y - (intersectionY - stopLineDistance);
            case 'south':
                return (intersectionY + stopLineDistance) - this.y;
            case 'east':
                return (intersectionX + stopLineDistance) - this.x;
            case 'west':
                return this.x - (intersectionX - stopLineDistance);
        }
    }

    hasPassedStopLine(intersectionX, intersectionY) {
        const stopLineDistance = ROAD_WIDTH/2 + STOP_LINE_OFFSET;
        
        switch(this.direction) {
            case 'north':
                return this.y < intersectionY - stopLineDistance;
            case 'south':
                return this.y + this.length > intersectionY + stopLineDistance;
            case 'east':
                return this.x + this.width > intersectionX + stopLineDistance;
            case 'west':
                return this.x < intersectionX - stopLineDistance;
        }
    }

    shouldStop(trafficLight, vehicles, intersectionX, intersectionY) {
        // If already past stop line, proceed through intersection
        if (this.hasPassedStopLine(intersectionX, intersectionY)) {
            this.inIntersection = true;
            this.waiting = false;
            return false;
        }

        // Reset intersection flag once we're clear
        if (this.inIntersection && !this.isInIntersection(intersectionX, intersectionY)) {
            this.inIntersection = false;
            this.crossingOnYellow = false;
        }

        // Check for vehicle collisions first
        if (this.checkVehicleCollision(vehicles)) {
            this.waiting = true;
            return true;
        }

        // Check traffic light only when approaching intersection
        if (this.isApproachingIntersection(intersectionX, intersectionY)) {
            // If the light is red, stop
            if (trafficLight.state === 'red') {
                this.waiting = true;
                return true;
            }

            // For yellow, stop unless we're very close to the intersection
            if (trafficLight.state === 'yellow') {
                const distanceToStop = this.getDistanceToStopLine(intersectionX, intersectionY);
                
                // If we're already committed to crossing or very close, proceed
                if (this.crossingOnYellow || distanceToStop < VEHICLE_LENGTH * 1.5) {
                    this.crossingOnYellow = true;
                    this.waiting = false;
                    return false;
                }
                
                // Otherwise stop
                this.waiting = true;
                return true;
            }
        }

        // For green light or not approaching intersection, proceed
        this.waiting = false;
        return false;
    }

    checkVehicleCollision(vehicles) {
        for (const other of vehicles) {
            if (other === this || other.direction !== this.direction) continue;

            const distance = this.getDistanceToVehicle(other);
            if (distance < SAFE_DISTANCE && distance > -VEHICLE_LENGTH) {
                return true;
            }
        }
        return false;
    }

    getDistanceToVehicle(other) {
        switch(this.direction) {
            case 'north':
                return other.y - (this.y + this.length);
            case 'south':
                return this.y - (other.y + other.length);
            case 'east':
                return other.x - (this.x + this.width);
            case 'west':
                return this.x - (other.x + other.width);
        }
    }

    move() {
        if (this.waiting) {
            this.waitTime++;
            return;
        }
        
        this.waitTime = 0;
        
        switch(this.direction) {
            case 'north':
                this.y -= this.speed;
                break;
            case 'south':
                this.y += this.speed;
                break;
            case 'east':
                this.x += this.speed;
                break;
            case 'west':
                this.x -= this.speed;
                break;
        }
    }

    draw(ctx) {
        const isHorizontal = this.direction === 'east' || this.direction === 'west';
        const displayWidth = isHorizontal ? this.length : this.width;
        const displayHeight = isHorizontal ? this.width : this.length;

        // Draw vehicle shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillRect(this.x + 2, this.y + 2, displayWidth, displayHeight);

        // Draw vehicle body
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, displayWidth, displayHeight);

        // Draw vehicle direction indicator
        ctx.fillStyle = '#000000';
        const center = this.getCenter();
        const radius = 2;
        ctx.beginPath();
        ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
        ctx.fill();
    }
}
