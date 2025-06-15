import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: number;
  source: 'geolocation' | 'ip' | 'manual';
}

export interface LocationError {
  code: number;
  message: string;
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class GeolocationService {
  private currentLocationSubject = new BehaviorSubject<UserLocation | null>(null);
  private locationErrorSubject = new BehaviorSubject<LocationError | null>(null);

  public currentLocation$ = this.currentLocationSubject.asObservable();
  public locationError$ = this.locationErrorSubject.asObservable();

  constructor() {}

  /**
   * Obtiene la ubicación del usuario usando múltiples métodos
   */
  async getCurrentLocation(options?: {
    timeout?: number;
    enableHighAccuracy?: boolean;
    maximumAge?: number;
    useIPFallback?: boolean;
  }): Promise<UserLocation> {
    const defaultOptions = {
      timeout: 10000,
      enableHighAccuracy: true,
      maximumAge: 300000, // 5 minutos
      useIPFallback: true,
      ...options
    };

    // Primero intentar con Geolocation API
    try {
      const location = await this.getGeolocationAPILocation(defaultOptions);
      this.currentLocationSubject.next(location);
      this.locationErrorSubject.next(null);
      return location;
    } catch (error) {
      console.warn('Geolocation API failed:', error);
      
      // Si falla y está habilitado el fallback, usar IP geolocation
      if (defaultOptions.useIPFallback) {
        try {
          const location = await this.getIPLocation();
          this.currentLocationSubject.next(location);
          this.locationErrorSubject.next(null);
          return location;
        } catch (ipError) {
          console.error('IP Geolocation failed:', ipError);
        }
      }

      // Si todo falla, lanzar error
      const locationError: LocationError = {
        code: (error as GeolocationPositionError)?.code || 999,
        message: this.getErrorMessage(error),
        timestamp: Date.now()
      };
      
      this.locationErrorSubject.next(locationError);
      throw locationError;
    }
  }

  /**
   * Obtiene ubicación usando Geolocation API
   */
  private getGeolocationAPILocation(options: any): Promise<UserLocation> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation no está soportado en este navegador'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: UserLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: Date.now(),
            source: 'geolocation'
          };
          resolve(location);
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: options.enableHighAccuracy,
          timeout: options.timeout,
          maximumAge: options.maximumAge
        }
      );
    });
  }

  /**
   * Obtiene ubicación usando IP geolocation como fallback
   */
  private async getIPLocation(): Promise<UserLocation> {
    try {
      // Usar ipapi.co como servicio gratuito
      const response = await fetch('https://ipapi.co/json/');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.latitude || !data.longitude) {
        throw new Error('No se pudieron obtener coordenadas del IP');
      }

      const location: UserLocation = {
        latitude: parseFloat(data.latitude),
        longitude: parseFloat(data.longitude),
        timestamp: Date.now(),
        source: 'ip'
      };

      return location;
    } catch (error) {
      throw new Error(`Error en IP geolocation: ${error}`);
    }
  }

  /**
   * Permite al usuario establecer su ubicación manualmente
   */
  setManualLocation(latitude: number, longitude: number): UserLocation {
    const location: UserLocation = {
      latitude,
      longitude,
      timestamp: Date.now(),
      source: 'manual'
    };

    this.currentLocationSubject.next(location);
    this.locationErrorSubject.next(null);
    
    return location;
  }

  /**
   * Calcula la distancia entre dos puntos en kilómetros usando la fórmula Haversine
   */
  calculateDistance(
    lat1: number, 
    lon1: number, 
    lat2: number, 
    lon2: number
  ): number {
    const R = 6371; // Radio de la Tierra en kilómetros
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    return Math.round(distance * 100) / 100; // Redondear a 2 decimales
  }

  /**
   * Convierte grados a radianes
   */
  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }

  /**
   * Obtiene un mensaje de error legible
   */
  private getErrorMessage(error: any): string {
    if (error instanceof GeolocationPositionError) {
      switch (error.code) {
        case error.PERMISSION_DENIED:
          return 'Acceso a la ubicación denegado por el usuario';
        case error.POSITION_UNAVAILABLE:
          return 'Información de ubicación no disponible';
        case error.TIMEOUT:
          return 'Tiempo de espera agotado para obtener ubicación';
        default:
          return 'Error desconocido al obtener ubicación';
      }
    }
    return error?.message || 'Error desconocido';
  }

  /**
   * Verifica si el navegador soporta geolocalización
   */
  isGeolocationSupported(): boolean {
    return 'geolocation' in navigator;
  }

  /**
   * Obtiene la ubicación actual sin lanzar errores
   */
  getCurrentLocationSafe(): UserLocation | null {
    return this.currentLocationSubject.value;
  }

  /**
   * Limpia la ubicación actual
   */
  clearLocation(): void {
    this.currentLocationSubject.next(null);
    this.locationErrorSubject.next(null);
  }

  /**
   * Formatea la distancia para mostrar
   */
  formatDistance(distance: number): string {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    } else if (distance < 10) {
      return `${distance.toFixed(1)}km`;
    } else {
      return `${Math.round(distance)}km`;
    }
  }
}
