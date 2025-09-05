export interface DataPackage<T = any> { // Add generic type parameter T with a default of any
  data: T;
  message: string;
  status: number;
  // Campos adicionales del backend
  status_text: string;
  status_code: number;
}