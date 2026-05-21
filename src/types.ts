export interface Transformer {
  id: string;
  name: string;
  location: string;
  type: string;
  nominalPower: number; // kVA
  primaryVoltage: number; // kV, e.g. 10
  secondaryVoltage: number; // kV, e.g. 0.4
  voltage: {
    A: number;
    B: number;
    C: number;
  };
  current: {
    A: number;
    B: number;
    C: number;
  };
  temperature: number; // Oil temperature in °C
  oilLevel: "normal" | "low";
  lastUpdated: string; // ISO string or relative
  status: "normal" | "warning" | "error";
  history: Array<{
    time: string;
    temp: number;
    load: number;
    voltageAvg: number;
  }>;
}

export interface AppNotification {
  id: string;
  time: string;
  transformerName: string;
  message: string;
  type: "info" | "warning" | "error";
}

export interface SimulatorSpeed {
  value: number; // speed multiplier or state
  isActive: boolean;
}
