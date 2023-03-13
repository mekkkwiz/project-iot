export interface Bin {
  id: string;
  location: {
    label: string;
    lat: number;
    lng: number;
  };
  status: "full" | "not full";
}
export interface DBbin {
  id: string;
  location: {
    label: string;
    lat: number;
    lng: number;
  };
  status: [
    {
      time: string;
      status: boolean;
    }
  ]
}