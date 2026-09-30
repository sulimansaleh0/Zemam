export interface Coordinates {
    lat: number;
    lng: number;
    speed: number | null;
    heading: number | null;
    accuracy: number;
}

export function getCurrentLocation(): Promise<Coordinates> {
    return new Promise((resolve, reject) => {
        if (typeof navigator === 'undefined' || !navigator.geolocation) {
            reject(new Error('Geolocation is not available in this browser.'));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            ({ coords }) => {
                resolve({ lat: coords.latitude, lng: coords.longitude, speed: coords.speed, heading: coords.heading, accuracy: coords.accuracy })
                console.log('Current location:', { lat: coords.latitude, lng: coords.longitude, accuracy: coords.accuracy });
            },
            reject,
            {
                enableHighAccuracy: true,
                maximumAge: 0,
            }
        );
    });
}

export function watchCurrentLocation(
    onLocation: (location: Coordinates) => void,
    onError: (error: GeolocationPositionError) => void,
    options?: PositionOptions
): (() => void) | null {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
        return null;
    }

    const watchId = navigator.geolocation.watchPosition(
        ({ coords }) => {
            onLocation({
                lat: coords.latitude,
                lng: coords.longitude,
                speed: coords.speed,
                heading: coords.heading,
                accuracy: coords.accuracy,
            });
        },
        onError,
        options
    );

    return () => navigator.geolocation.clearWatch(watchId);
}