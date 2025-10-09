// Country and State data with timezone mapping
import { getTimezoneByValue } from './timezone-utils';

export interface Country {
  code: string;
  name: string;
  timezones: string[];
}

export interface State {
  code: string;
  name: string;
  countryCode: string;
  timezone: string;
}

export const countries: Country[] = [
  {
    code: "US",
    name: "United States",
    timezones: ["America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles", "America/Anchorage", "Pacific/Honolulu"]
  },
  {
    code: "CA",
    name: "Canada",
    timezones: ["America/St_Johns", "America/Halifax", "America/Toronto", "America/Winnipeg", "America/Edmonton", "America/Vancouver"]
  },
  {
    code: "GB",
    name: "United Kingdom",
    timezones: ["Europe/London"]
  },
  {
    code: "AU",
    name: "Australia",
    timezones: ["Australia/Perth", "Australia/Adelaide", "Australia/Brisbane", "Australia/Sydney", "Australia/Melbourne"]
  },
  {
    code: "DE",
    name: "Germany",
    timezones: ["Europe/Berlin"]
  },
  {
    code: "FR",
    name: "France",
    timezones: ["Europe/Paris"]
  },
  {
    code: "IT",
    name: "Italy",
    timezones: ["Europe/Rome"]
  },
  {
    code: "ES",
    name: "Spain",
    timezones: ["Europe/Madrid"]
  },
  {
    code: "NL",
    name: "Netherlands",
    timezones: ["Europe/Amsterdam"]
  },
  {
    code: "BE",
    name: "Belgium",
    timezones: ["Europe/Brussels"]
  },
  {
    code: "CH",
    name: "Switzerland",
    timezones: ["Europe/Zurich"]
  },
  {
    code: "AT",
    name: "Austria",
    timezones: ["Europe/Vienna"]
  },
  {
    code: "SE",
    name: "Sweden",
    timezones: ["Europe/Stockholm"]
  },
  {
    code: "NO",
    name: "Norway",
    timezones: ["Europe/Oslo"]
  },
  {
    code: "DK",
    name: "Denmark",
    timezones: ["Europe/Copenhagen"]
  },
  {
    code: "FI",
    name: "Finland",
    timezones: ["Europe/Helsinki"]
  },
  {
    code: "JP",
    name: "Japan",
    timezones: ["Asia/Tokyo"]
  },
  {
    code: "KR",
    name: "South Korea",
    timezones: ["Asia/Seoul"]
  },
  {
    code: "CN",
    name: "China",
    timezones: ["Asia/Shanghai"]
  },
  {
    code: "IN",
    name: "India",
    timezones: ["Asia/Kolkata"]
  },
  {
    code: "SG",
    name: "Singapore",
    timezones: ["Asia/Singapore"]
  },
  {
    code: "HK",
    name: "Hong Kong",
    timezones: ["Asia/Hong_Kong"]
  },
  {
    code: "NZ",
    name: "New Zealand",
    timezones: ["Pacific/Auckland"]
  },
  {
    code: "BR",
    name: "Brazil",
    timezones: ["America/Sao_Paulo", "America/Manaus", "America/Fortaleza"]
  },
  {
    code: "MX",
    name: "Mexico",
    timezones: ["America/Mexico_City", "America/Tijuana", "America/Cancun"]
  }
];

export const states: State[] = [
  // US States
  { code: "AL", name: "Alabama", countryCode: "US", timezone: "America/Chicago" },
  { code: "AK", name: "Alaska", countryCode: "US", timezone: "America/Anchorage" },
  { code: "AZ", name: "Arizona", countryCode: "US", timezone: "America/Denver" },
  { code: "AR", name: "Arkansas", countryCode: "US", timezone: "America/Chicago" },
  { code: "CA", name: "California", countryCode: "US", timezone: "America/Los_Angeles" },
  { code: "CO", name: "Colorado", countryCode: "US", timezone: "America/Denver" },
  { code: "CT", name: "Connecticut", countryCode: "US", timezone: "America/New_York" },
  { code: "DE", name: "Delaware", countryCode: "US", timezone: "America/New_York" },
  { code: "FL", name: "Florida", countryCode: "US", timezone: "America/New_York" },
  { code: "GA", name: "Georgia", countryCode: "US", timezone: "America/New_York" },
  { code: "HI", name: "Hawaii", countryCode: "US", timezone: "Pacific/Honolulu" },
  { code: "ID", name: "Idaho", countryCode: "US", timezone: "America/Denver" },
  { code: "IL", name: "Illinois", countryCode: "US", timezone: "America/Chicago" },
  { code: "IN", name: "Indiana", countryCode: "US", timezone: "America/New_York" },
  { code: "IA", name: "Iowa", countryCode: "US", timezone: "America/Chicago" },
  { code: "KS", name: "Kansas", countryCode: "US", timezone: "America/Chicago" },
  { code: "KY", name: "Kentucky", countryCode: "US", timezone: "America/New_York" },
  { code: "LA", name: "Louisiana", countryCode: "US", timezone: "America/Chicago" },
  { code: "ME", name: "Maine", countryCode: "US", timezone: "America/New_York" },
  { code: "MD", name: "Maryland", countryCode: "US", timezone: "America/New_York" },
  { code: "MA", name: "Massachusetts", countryCode: "US", timezone: "America/New_York" },
  { code: "MI", name: "Michigan", countryCode: "US", timezone: "America/New_York" },
  { code: "MN", name: "Minnesota", countryCode: "US", timezone: "America/Chicago" },
  { code: "MS", name: "Mississippi", countryCode: "US", timezone: "America/Chicago" },
  { code: "MO", name: "Missouri", countryCode: "US", timezone: "America/Chicago" },
  { code: "MT", name: "Montana", countryCode: "US", timezone: "America/Denver" },
  { code: "NE", name: "Nebraska", countryCode: "US", timezone: "America/Chicago" },
  { code: "NV", name: "Nevada", countryCode: "US", timezone: "America/Los_Angeles" },
  { code: "NH", name: "New Hampshire", countryCode: "US", timezone: "America/New_York" },
  { code: "NJ", name: "New Jersey", countryCode: "US", timezone: "America/New_York" },
  { code: "NM", name: "New Mexico", countryCode: "US", timezone: "America/Denver" },
  { code: "NY", name: "New York", countryCode: "US", timezone: "America/New_York" },
  { code: "NC", name: "North Carolina", countryCode: "US", timezone: "America/New_York" },
  { code: "ND", name: "North Dakota", countryCode: "US", timezone: "America/Chicago" },
  { code: "OH", name: "Ohio", countryCode: "US", timezone: "America/New_York" },
  { code: "OK", name: "Oklahoma", countryCode: "US", timezone: "America/Chicago" },
  { code: "OR", name: "Oregon", countryCode: "US", timezone: "America/Los_Angeles" },
  { code: "PA", name: "Pennsylvania", countryCode: "US", timezone: "America/New_York" },
  { code: "RI", name: "Rhode Island", countryCode: "US", timezone: "America/New_York" },
  { code: "SC", name: "South Carolina", countryCode: "US", timezone: "America/New_York" },
  { code: "SD", name: "South Dakota", countryCode: "US", timezone: "America/Chicago" },
  { code: "TN", name: "Tennessee", countryCode: "US", timezone: "America/Chicago" },
  { code: "TX", name: "Texas", countryCode: "US", timezone: "America/Chicago" },
  { code: "UT", name: "Utah", countryCode: "US", timezone: "America/Denver" },
  { code: "VT", name: "Vermont", countryCode: "US", timezone: "America/New_York" },
  { code: "VA", name: "Virginia", countryCode: "US", timezone: "America/New_York" },
  { code: "WA", name: "Washington", countryCode: "US", timezone: "America/Los_Angeles" },
  { code: "WV", name: "West Virginia", countryCode: "US", timezone: "America/New_York" },
  { code: "WI", name: "Wisconsin", countryCode: "US", timezone: "America/Chicago" },
  { code: "WY", name: "Wyoming", countryCode: "US", timezone: "America/Denver" },

  // Canadian Provinces
  { code: "AB", name: "Alberta", countryCode: "CA", timezone: "America/Edmonton" },
  { code: "BC", name: "British Columbia", countryCode: "CA", timezone: "America/Vancouver" },
  { code: "MB", name: "Manitoba", countryCode: "CA", timezone: "America/Winnipeg" },
  { code: "NB", name: "New Brunswick", countryCode: "CA", timezone: "America/Halifax" },
  { code: "NL", name: "Newfoundland and Labrador", countryCode: "CA", timezone: "America/St_Johns" },
  { code: "NS", name: "Nova Scotia", countryCode: "CA", timezone: "America/Halifax" },
  { code: "ON", name: "Ontario", countryCode: "CA", timezone: "America/Toronto" },
  { code: "PE", name: "Prince Edward Island", countryCode: "CA", timezone: "America/Halifax" },
  { code: "QC", name: "Quebec", countryCode: "CA", timezone: "America/Toronto" },
  { code: "SK", name: "Saskatchewan", countryCode: "CA", timezone: "America/Regina" },
  { code: "NT", name: "Northwest Territories", countryCode: "CA", timezone: "America/Yellowknife" },
  { code: "NU", name: "Nunavut", countryCode: "CA", timezone: "America/Iqaluit" },
  { code: "YT", name: "Yukon", countryCode: "CA", timezone: "America/Whitehorse" },

  // Australian States
  { code: "NSW", name: "New South Wales", countryCode: "AU", timezone: "Australia/Sydney" },
  { code: "VIC", name: "Victoria", countryCode: "AU", timezone: "Australia/Melbourne" },
  { code: "QLD", name: "Queensland", countryCode: "AU", timezone: "Australia/Brisbane" },
  { code: "WA", name: "Western Australia", countryCode: "AU", timezone: "Australia/Perth" },
  { code: "SA", name: "South Australia", countryCode: "AU", timezone: "Australia/Adelaide" },
  { code: "TAS", name: "Tasmania", countryCode: "AU", timezone: "Australia/Hobart" },
  { code: "ACT", name: "Australian Capital Territory", countryCode: "AU", timezone: "Australia/Sydney" },
  { code: "NT", name: "Northern Territory", countryCode: "AU", timezone: "Australia/Darwin" },

  // UK Countries (for completeness)
  { code: "ENG", name: "England", countryCode: "GB", timezone: "Europe/London" },
  { code: "SCT", name: "Scotland", countryCode: "GB", timezone: "Europe/London" },
  { code: "WLS", name: "Wales", countryCode: "GB", timezone: "Europe/London" },
  { code: "NIR", name: "Northern Ireland", countryCode: "GB", timezone: "Europe/London" }
];

// Helper functions
export const getStatesByCountry = (countryCode: string): State[] => {
  return states.filter(state => state.countryCode === countryCode);
};

export const getTimezoneForState = (stateCode: string, countryCode: string): string => {
  const state = states.find(s => s.code === stateCode && s.countryCode === countryCode);
  return state?.timezone || "UTC";
};

export const getTimezoneForLocation = (stateName: string, countryName: string): string => {
  const country = countries.find(c => c.name === countryName);
  if (!country) return "UTC";
  
  const state = states.find(s => s.name === stateName && s.countryCode === country.code);
  return state?.timezone || country.timezones[0] || "UTC";
};

export const formatLocation = (stateName: string, countryName: string): string => {
  return `${stateName}, ${countryName}`;
};

export const parseLocation = (location: string): { state: string; country: string } | null => {
  const parts = location.split(', ');
  if (parts.length === 2) {
    return {
      state: parts[0].trim(),
      country: parts[1].trim()
    };
  }
  return null;
};

export const getTimezoneLabel = (timezone: string): string => {
  const timezoneInfo = getTimezoneByValue(timezone);
  return timezoneInfo ? timezoneInfo.label : timezone;
};