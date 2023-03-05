export interface Bin {
  id: string;
  location: {
    lat: number;
    lng: number;
  };
  status: "full" | "not full";
}