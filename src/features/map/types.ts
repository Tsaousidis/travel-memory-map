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

export type TripSummary = {
  id: string;
  title: string;
  countryCode: string;
  countryName: string;
  startDate: string;
  endDate: string;
  description: string;
  cityCount: number;
  placeCount: number;
  photoCount: number;
};

export type TripDetails = {
  id: string;
  title: string;
  countryName: string;
  startDate: string;
  endDate: string;
  description: string;
  notes: string;
  cities: Array<{ id: string; tripCityId: string; name: string; countryCode: string; latitude: number; longitude: number }>;
  places: Array<{ id: string; tripCityId: string; name: string; category: string; cityName: string; latitude: number; longitude: number; visitedOn: string | null; notes: string }>;
  photoCount: number;
};
