export interface Point3D {
  x: number;
  y: number;
  z: number;
}

export interface Cavity {
  width: number;
  height: number;
  volume: number;
  position?: Point3D;  
}

export interface CavityPosition {
  position: Point3D;
  volume: number;
}