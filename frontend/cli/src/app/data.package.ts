export interface DataPackage<T = any> { // Add generic type parameter T with a default of any
  data: T;
  message: string;
  status: number;
}