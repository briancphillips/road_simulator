import { Vehicle } from '../js/Vehicle';
import { VEHICLE_LENGTH, VEHICLE_WIDTH, VEHICLE_SPEED } from '../js/constants';

describe('Vehicle', () => {
    let vehicle;

    beforeEach(() => {
        vehicle = new Vehicle(100, 100, 'north');
    });

    describe('Movement', () => {
        test('should move in the correct direction', () => {
            const initialY = vehicle.y;
            vehicle.move();
            expect(vehicle.y).toBe(initialY - VEHICLE_SPEED);
        });

        test('should not move when waiting', () => {
            vehicle.waiting = true;
            const initialY = vehicle.y;
            vehicle.move();
            expect(vehicle.y).toBe(initialY);
            expect(vehicle.waitTime).toBe(1);
        });
    });

    describe('Intersection Detection', () => {
        test('should detect when in intersection', () => {
            const intersectionX = 100;
            const intersectionY = 100;
            expect(vehicle.isInIntersection(intersectionX, intersectionY)).toBe(true);
        });

        test('should detect when approaching intersection', () => {
            const intersectionX = 100;
            const intersectionY = 50;
            expect(vehicle.isApproachingIntersection(intersectionX, intersectionY)).toBe(true);
        });
    });

    describe('Stop Line Detection', () => {
        test('should calculate correct distance to stop line', () => {
            const intersectionX = 100;
            const intersectionY = 50;
            const distance = vehicle.getDistanceToStopLine(intersectionX, intersectionY);
            expect(distance).toBeGreaterThan(0);
        });

        test('should detect when passed stop line', () => {
            const intersectionX = 100;
            const intersectionY = 150;
            expect(vehicle.hasPassedStopLine(intersectionX, intersectionY)).toBe(true);
        });
    });

    describe('Collision Detection', () => {
        test('should detect collision with nearby vehicle', () => {
            const otherVehicle = new Vehicle(100, 120, 'north');
            expect(vehicle.checkVehicleCollision([otherVehicle])).toBe(true);
        });

        test('should not detect collision with distant vehicle', () => {
            const otherVehicle = new Vehicle(100, 300, 'north');
            expect(vehicle.checkVehicleCollision([otherVehicle])).toBe(false);
        });
    });
});
