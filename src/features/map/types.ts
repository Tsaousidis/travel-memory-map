export type TripPin = {
  id: string;
  tripTitle: string;
  cityName: string;
  countryCode: string;
  longitude: number;
  latitude: number;
  startDate: string;
  endDate: string;
};

export type PlacePin = {
  id: string;
  placeName: string;
  cityName: string;
  tripTitle: string;
  category: string;
  longitude: number;
  latitude: number;
  visitedOn: string | null;
};
