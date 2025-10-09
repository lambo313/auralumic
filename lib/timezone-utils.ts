// Comprehensive timezone utilities with grouped options

export interface Timezone {
  value: string;
  label: string;
  offset: string;
  region: string;
}

export interface TimezoneGroup {
  region: string;
  timezones: Timezone[];
}

// Comprehensive timezone list organized by region
export const timezoneGroups: TimezoneGroup[] = [
  {
    region: "North America",
    timezones: [
      { value: "America/New_York", label: "Eastern Time (New York)", offset: "UTC-5/-4", region: "North America" },
      { value: "America/Chicago", label: "Central Time (Chicago)", offset: "UTC-6/-5", region: "North America" },
      { value: "America/Denver", label: "Mountain Time (Denver)", offset: "UTC-7/-6", region: "North America" },
      { value: "America/Los_Angeles", label: "Pacific Time (Los Angeles)", offset: "UTC-8/-7", region: "North America" },
      { value: "America/Anchorage", label: "Alaska Time (Anchorage)", offset: "UTC-9/-8", region: "North America" },
      { value: "Pacific/Honolulu", label: "Hawaii Time (Honolulu)", offset: "UTC-10", region: "North America" },
      { value: "America/Toronto", label: "Eastern Time (Toronto)", offset: "UTC-5/-4", region: "North America" },
      { value: "America/Vancouver", label: "Pacific Time (Vancouver)", offset: "UTC-8/-7", region: "North America" },
      { value: "America/Edmonton", label: "Mountain Time (Edmonton)", offset: "UTC-7/-6", region: "North America" },
      { value: "America/Winnipeg", label: "Central Time (Winnipeg)", offset: "UTC-6/-5", region: "North America" },
      { value: "America/Halifax", label: "Atlantic Time (Halifax)", offset: "UTC-4/-3", region: "North America" },
      { value: "America/St_Johns", label: "Newfoundland Time", offset: "UTC-3:30/-2:30", region: "North America" },
      { value: "America/Mexico_City", label: "Central Time (Mexico City)", offset: "UTC-6/-5", region: "North America" },
      { value: "America/Tijuana", label: "Pacific Time (Tijuana)", offset: "UTC-8/-7", region: "North America" },
      { value: "America/Cancun", label: "Eastern Time (Cancun)", offset: "UTC-5", region: "North America" }
    ]
  },
  {
    region: "Europe",
    timezones: [
      { value: "Europe/London", label: "Greenwich Mean Time (London)", offset: "UTC+0/+1", region: "Europe" },
      { value: "Europe/Paris", label: "Central European Time (Paris)", offset: "UTC+1/+2", region: "Europe" },
      { value: "Europe/Berlin", label: "Central European Time (Berlin)", offset: "UTC+1/+2", region: "Europe" },
      { value: "Europe/Rome", label: "Central European Time (Rome)", offset: "UTC+1/+2", region: "Europe" },
      { value: "Europe/Madrid", label: "Central European Time (Madrid)", offset: "UTC+1/+2", region: "Europe" },
      { value: "Europe/Amsterdam", label: "Central European Time (Amsterdam)", offset: "UTC+1/+2", region: "Europe" },
      { value: "Europe/Brussels", label: "Central European Time (Brussels)", offset: "UTC+1/+2", region: "Europe" },
      { value: "Europe/Zurich", label: "Central European Time (Zurich)", offset: "UTC+1/+2", region: "Europe" },
      { value: "Europe/Vienna", label: "Central European Time (Vienna)", offset: "UTC+1/+2", region: "Europe" },
      { value: "Europe/Stockholm", label: "Central European Time (Stockholm)", offset: "UTC+1/+2", region: "Europe" },
      { value: "Europe/Oslo", label: "Central European Time (Oslo)", offset: "UTC+1/+2", region: "Europe" },
      { value: "Europe/Copenhagen", label: "Central European Time (Copenhagen)", offset: "UTC+1/+2", region: "Europe" },
      { value: "Europe/Helsinki", label: "Eastern European Time (Helsinki)", offset: "UTC+2/+3", region: "Europe" },
      { value: "Europe/Dublin", label: "Greenwich Mean Time (Dublin)", offset: "UTC+0/+1", region: "Europe" },
      { value: "Europe/Lisbon", label: "Western European Time (Lisbon)", offset: "UTC+0/+1", region: "Europe" },
      { value: "Europe/Athens", label: "Eastern European Time (Athens)", offset: "UTC+2/+3", region: "Europe" },
      { value: "Europe/Warsaw", label: "Central European Time (Warsaw)", offset: "UTC+1/+2", region: "Europe" },
      { value: "Europe/Prague", label: "Central European Time (Prague)", offset: "UTC+1/+2", region: "Europe" },
      { value: "Europe/Budapest", label: "Central European Time (Budapest)", offset: "UTC+1/+2", region: "Europe" },
      { value: "Europe/Moscow", label: "Moscow Standard Time", offset: "UTC+3", region: "Europe" }
    ]
  },
  {
    region: "Asia",
    timezones: [
      { value: "Asia/Tokyo", label: "Japan Standard Time (Tokyo)", offset: "UTC+9", region: "Asia" },
      { value: "Asia/Seoul", label: "Korea Standard Time (Seoul)", offset: "UTC+9", region: "Asia" },
      { value: "Asia/Shanghai", label: "China Standard Time (Shanghai)", offset: "UTC+8", region: "Asia" },
      { value: "Asia/Hong_Kong", label: "Hong Kong Time", offset: "UTC+8", region: "Asia" },
      { value: "Asia/Singapore", label: "Singapore Standard Time", offset: "UTC+8", region: "Asia" },
      { value: "Asia/Kolkata", label: "India Standard Time (Kolkata)", offset: "UTC+5:30", region: "Asia" },
      { value: "Asia/Dubai", label: "Gulf Standard Time (Dubai)", offset: "UTC+4", region: "Asia" },
      { value: "Asia/Bangkok", label: "Indochina Time (Bangkok)", offset: "UTC+7", region: "Asia" },
      { value: "Asia/Manila", label: "Philippines Time (Manila)", offset: "UTC+8", region: "Asia" },
      { value: "Asia/Jakarta", label: "Western Indonesia Time (Jakarta)", offset: "UTC+7", region: "Asia" },
      { value: "Asia/Kuala_Lumpur", label: "Malaysia Time (Kuala Lumpur)", offset: "UTC+8", region: "Asia" },
      { value: "Asia/Taipei", label: "Taipei Standard Time", offset: "UTC+8", region: "Asia" },
      { value: "Asia/Ho_Chi_Minh", label: "Indochina Time (Ho Chi Minh)", offset: "UTC+7", region: "Asia" },
      { value: "Asia/Dhaka", label: "Bangladesh Standard Time (Dhaka)", offset: "UTC+6", region: "Asia" },
      { value: "Asia/Karachi", label: "Pakistan Standard Time (Karachi)", offset: "UTC+5", region: "Asia" },
      { value: "Asia/Tehran", label: "Iran Standard Time (Tehran)", offset: "UTC+3:30/+4:30", region: "Asia" },
      { value: "Asia/Jerusalem", label: "Israel Standard Time (Jerusalem)", offset: "UTC+2/+3", region: "Asia" },
      { value: "Asia/Riyadh", label: "Arabia Standard Time (Riyadh)", offset: "UTC+3", region: "Asia" }
    ]
  },
  {
    region: "Australia & Oceania",
    timezones: [
      { value: "Australia/Sydney", label: "Australian Eastern Time (Sydney)", offset: "UTC+10/+11", region: "Australia & Oceania" },
      { value: "Australia/Melbourne", label: "Australian Eastern Time (Melbourne)", offset: "UTC+10/+11", region: "Australia & Oceania" },
      { value: "Australia/Brisbane", label: "Australian Eastern Time (Brisbane)", offset: "UTC+10", region: "Australia & Oceania" },
      { value: "Australia/Perth", label: "Australian Western Time (Perth)", offset: "UTC+8", region: "Australia & Oceania" },
      { value: "Australia/Adelaide", label: "Australian Central Time (Adelaide)", offset: "UTC+9:30/+10:30", region: "Australia & Oceania" },
      { value: "Australia/Darwin", label: "Australian Central Time (Darwin)", offset: "UTC+9:30", region: "Australia & Oceania" },
      { value: "Australia/Hobart", label: "Australian Eastern Time (Hobart)", offset: "UTC+10/+11", region: "Australia & Oceania" },
      { value: "Pacific/Auckland", label: "New Zealand Standard Time (Auckland)", offset: "UTC+12/+13", region: "Australia & Oceania" },
      { value: "Pacific/Fiji", label: "Fiji Time", offset: "UTC+12/+13", region: "Australia & Oceania" },
      { value: "Pacific/Guam", label: "Chamorro Standard Time (Guam)", offset: "UTC+10", region: "Australia & Oceania" }
    ]
  },
  {
    region: "South America",
    timezones: [
      { value: "America/Sao_Paulo", label: "Brasília Time (São Paulo)", offset: "UTC-3/-2", region: "South America" },
      { value: "America/Argentina/Buenos_Aires", label: "Argentina Time (Buenos Aires)", offset: "UTC-3", region: "South America" },
      { value: "America/Santiago", label: "Chile Time (Santiago)", offset: "UTC-4/-3", region: "South America" },
      { value: "America/Lima", label: "Peru Time (Lima)", offset: "UTC-5", region: "South America" },
      { value: "America/Bogota", label: "Colombia Time (Bogotá)", offset: "UTC-5", region: "South America" },
      { value: "America/Caracas", label: "Venezuela Time (Caracas)", offset: "UTC-4", region: "South America" },
      { value: "America/La_Paz", label: "Bolivia Time (La Paz)", offset: "UTC-4", region: "South America" },
      { value: "America/Montevideo", label: "Uruguay Time (Montevideo)", offset: "UTC-3/-2", region: "South America" },
      { value: "America/Asuncion", label: "Paraguay Time (Asunción)", offset: "UTC-3/-4", region: "South America" },
      { value: "America/Guyana", label: "Guyana Time", offset: "UTC-4", region: "South America" }
    ]
  },
  {
    region: "Africa",
    timezones: [
      { value: "Africa/Cairo", label: "Eastern European Time (Cairo)", offset: "UTC+2", region: "Africa" },
      { value: "Africa/Lagos", label: "West Africa Time (Lagos)", offset: "UTC+1", region: "Africa" },
      { value: "Africa/Johannesburg", label: "South Africa Standard Time", offset: "UTC+2", region: "Africa" },
      { value: "Africa/Nairobi", label: "East Africa Time (Nairobi)", offset: "UTC+3", region: "Africa" },
      { value: "Africa/Casablanca", label: "Western European Time (Casablanca)", offset: "UTC+0/+1", region: "Africa" },
      { value: "Africa/Tunis", label: "Central European Time (Tunis)", offset: "UTC+1", region: "Africa" },
      { value: "Africa/Algiers", label: "Central European Time (Algiers)", offset: "UTC+1", region: "Africa" },
      { value: "Africa/Addis_Ababa", label: "East Africa Time (Addis Ababa)", offset: "UTC+3", region: "Africa" }
    ]
  },
  {
    region: "UTC",
    timezones: [
      { value: "UTC", label: "Coordinated Universal Time (UTC)", offset: "UTC+0", region: "UTC" }
    ]
  }
];

// Flattened list for easy access
export const allTimezones: Timezone[] = timezoneGroups.flatMap(group => group.timezones);

// Helper functions
export const getTimezoneByValue = (value: string): Timezone | undefined => {
  return allTimezones.find(tz => tz.value === value);
};

export const getTimezonesByRegion = (region: string): Timezone[] => {
  const group = timezoneGroups.find(g => g.region === region);
  return group ? group.timezones : [];
};

export const formatTimezoneLabel = (timezone: Timezone): string => {
  return `${timezone.label} (${timezone.offset})`;
};

// Common timezone shortcuts for quick access
export const commonTimezones = [
  "UTC",
  "America/New_York",
  "America/Chicago", 
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Asia/Tokyo",
  "Australia/Sydney"
];

export const getCommonTimezones = (): Timezone[] => {
  return commonTimezones.map(tz => getTimezoneByValue(tz)).filter(Boolean) as Timezone[];
};

// Search function for timezone lookup
export const searchTimezones = (query: string): Timezone[] => {
  const lowerQuery = query.toLowerCase();
  return allTimezones.filter(tz => 
    tz.label.toLowerCase().includes(lowerQuery) ||
    tz.value.toLowerCase().includes(lowerQuery) ||
    tz.region.toLowerCase().includes(lowerQuery)
  );
};