
export interface DTIStatus {
  value: number;
  status: 'normal' | 'caution' | 'warning' | 'exceeded';
  message: string;
  helpText: string;
}

export interface DTILimits {
  frontEnd: {
    default: number;
    maximum: number;
    warning: number;
    hardCap: number | null;
  };
  backEnd: {
    default: number;
    maximum: number;
    warning: number;
    hardCap: number | null;
  };
}
