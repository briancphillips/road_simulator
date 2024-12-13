import { TrafficSystem } from '../js/TrafficSystem';
import { Vehicle } from '../js/Vehicle';
import { TrafficLight } from '../js/TrafficLight';

describe('TrafficSystem', () => {
    let system;
    let canvas;

    beforeEach(() => {
        canvas = new HTMLCanvasElement();
        system = new TrafficSystem(canvas);
    });

    describe('Vehicle Management', () => {
        test('should add vehicles correctly', () => {
            const vehicle = new Vehicle(100, 100, 'north');
            system.addVehicle(vehicle);
            expect(system.vehicles).toContain(vehicle);
        });

        test('should remove vehicles outside bounds', () => {
            const vehicle = new Vehicle(-1000, -1000, 'north');
            system.addVehicle(vehicle);
            system.updateVehicles();
            expect(system.vehicles).not.toContain(vehicle);
        });
    });

    describe('Traffic Light Management', () => {
        test('should update all traffic lights', () => {
            const light = system.trafficLights[0]; // Use existing traffic light
            const initialTimer = light.timer;
            
            system.updateTrafficLights();
            
            expect(light.timer).not.toBe(initialTimer);
        });
    });

    describe('System Updates', () => {
        test('should handle vehicle-light interactions', () => {
            const vehicle = new Vehicle(100, 100, 'north');
            system.addVehicle(vehicle);
            
            // Get the nearest traffic light
            const light = system.trafficLights.find(l => 
                Math.abs(l.x - vehicle.x) < 50 && 
                Math.abs(l.y - vehicle.y) < 50
            );
            
            if (light) {
                light.state = 'red';
                system.update();
                expect(vehicle.waiting).toBe(true);
            }
        });
    });
});
