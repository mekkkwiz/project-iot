export interface Bin {
  id: string;
  location: {
    label: string;
    lat: number;
    lng: number;
  };
  status: [
    {
      time: string;
      isFull: boolean;
    }
  ]
}