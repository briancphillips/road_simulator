import { LIGHT_RADIUS, LIGHT_SPACING, LIGHT_BOX_SHORT, LIGHT_BOX_LONG, LIGHT_TIMINGS } from './constants.js';

export class TrafficLight {
    constructor(direction) {
        this.direction = direction; // 'northSouth' or 'eastWest'
        this.state = direction === 'northSouth' ? 'green' : 'red';
        this.timer = 0;
        this.lastUpdate = Date.now();
        // Correct order: green, yellow, red
        this.states = ['green', 'yellow', 'red'];
    }

    update() {
        const now = Date.now();
        const deltaTime = now - this.lastUpdate;
        this.timer += deltaTime;
        this.lastUpdate = now;
        
        // State transitions based on timer in milliseconds
        switch (this.state) {
            case 'green':
                if (this.timer >= LIGHT_TIMINGS.green) {
                    this.state = 'yellow';
                    this.timer = 0;
                }
                break;
            case 'yellow':
                if (this.timer >= LIGHT_TIMINGS.yellow) {
                    this.state = 'red';
                    this.timer = 0;
                    return true; // Signals completion of cycle
                }
                break;
            case 'red':
                // Red duration is controlled by the other direction's green+yellow
                break;
        }
        return false;
    }

    draw(ctx, x, y) {
        const colors = {
            red: '#ff0000',
            yellow: '#ffff00',
            green: '#00ff00'
        };

        // Draw black background box
        ctx.fillStyle = '#000';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        
        let boxX, boxY, boxWidth, boxHeight;
        
        // North/South traffic gets horizontal lights, East/West gets vertical
        const isHorizontal = this.direction === 'northSouth';
        
        if (isHorizontal) {
            // Horizontal light box (lights side by side)
            boxWidth = LIGHT_BOX_LONG;
            boxHeight = LIGHT_BOX_SHORT;
        } else {
            // Vertical light box (lights stacked)
            boxWidth = LIGHT_BOX_SHORT;
            boxHeight = LIGHT_BOX_LONG;
        }
        
        boxX = x - boxWidth/2;
        boxY = y - boxHeight/2;
        
        // Draw box with border
        ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
        ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);

        // Draw lights in order: green, yellow, red
        this.states.forEach((color, index) => {
            let lightX, lightY;
            
            if (isHorizontal) {
                // Horizontal arrangement (side by side)
                lightX = x + (index - 1) * LIGHT_SPACING;
                lightY = y;
            } else {
                // Vertical arrangement (stacked)
                lightX = x;
                lightY = y + (index - 1) * LIGHT_SPACING;
            }

            // Draw light circle
            ctx.beginPath();
            ctx.arc(lightX, lightY, LIGHT_RADIUS, 0, Math.PI * 2);
            
            // Set light color
            if (this.state === color) {
                ctx.fillStyle = colors[color];
            } else {
                ctx.fillStyle = '#404040';
            }
            
            ctx.fill();
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 1;
            ctx.stroke();
        });
    }
}
