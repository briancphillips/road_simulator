import { TrafficLight } from '../js/TrafficLight';

describe('TrafficLight', () => {
    let trafficLight;

    beforeEach(() => {
        trafficLight = new TrafficLight(100, 100, 'north');
    });

    describe('State Changes', () => {
        test('should initialize with red light', () => {
            expect(trafficLight.state).toBe('red');
        });

        test('should change states correctly', () => {
            trafficLight.setState('green');
            expect(trafficLight.state).toBe('green');
            
            trafficLight.setState('yellow');
            expect(trafficLight.state).toBe('yellow');
            
            trafficLight.setState('red');
            expect(trafficLight.state).toBe('red');
        });
    });

    describe('Timer Management', () => {
        test('should update timer correctly', () => {
            const initialTime = trafficLight.timer;
            trafficLight.update();
            expect(trafficLight.timer).toBe(initialTime + 1);
        });

        test('should reset timer on state change', () => {
            trafficLight.timer = 50;
            trafficLight.setState('green');
            expect(trafficLight.timer).toBe(0);
        });
    });
});
