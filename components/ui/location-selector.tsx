"use client";

import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormLabel } from "@/components/ui/form";
import { countries, states, getStatesByCountry, getTimezoneForState, formatLocation, parseLocation } from "@/lib/location-utils";

interface LocationSelectorProps {
  value?: string; // Format: "State, Country"
  onChange: (location: string, timezone: string) => void;
  onTimezoneChange?: (timezone: string) => void;
}

export function LocationSelector({ value, onChange, onTimezoneChange }: LocationSelectorProps) {
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [selectedState, setSelectedState] = useState<string>("");
  const [availableStates, setAvailableStates] = useState(getStatesByCountry(""));

  // Parse initial value
  useEffect(() => {
    if (value) {
      const parsed = parseLocation(value);
      if (parsed) {
        const country = countries.find(c => c.name === parsed.country);
        if (country) {
          setSelectedCountry(country.code);
          setAvailableStates(getStatesByCountry(country.code));
          
          const state = states.find(s => s.name === parsed.state && s.countryCode === country.code);
          if (state) {
            setSelectedState(state.code);
          }
        }
      }
    }
  }, [value]);

  const handleCountryChange = (countryCode: string) => {
    setSelectedCountry(countryCode);
    setSelectedState("");
    setAvailableStates(getStatesByCountry(countryCode));
  };

  const handleStateChange = (stateCode: string) => {
    setSelectedState(stateCode);
    
    const country = countries.find(c => c.code === selectedCountry);
    const state = states.find(s => s.code === stateCode && s.countryCode === selectedCountry);
    
    if (country && state) {
      const locationString = formatLocation(state.name, country.name);
      const timezone = getTimezoneForState(stateCode, selectedCountry);
      
      onChange(locationString, timezone);
      if (onTimezoneChange) {
        onTimezoneChange(timezone);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <FormLabel>Country</FormLabel>
        <Select value={selectedCountry} onValueChange={handleCountryChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select a country" />
          </SelectTrigger>
          <SelectContent className="max-h-60 overflow-y-auto">
            {countries.map((country) => (
              <SelectItem key={country.code} value={country.code}>
                {country.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedCountry && availableStates.length > 0 && (
        <div className="space-y-2">
          <FormLabel>State/Province</FormLabel>
          <Select value={selectedState} onValueChange={handleStateChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select a state/province" />
            </SelectTrigger>
            <SelectContent className="max-h-60 overflow-y-auto">
              {availableStates.map((state) => (
                <SelectItem key={state.code} value={state.code}>
                  {state.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}