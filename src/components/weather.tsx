import {
  Droplets,
  Wind,
  Thermometer,
  MapPin,
  Gauge,
  Sun,
  CloudSun,
  Cloudy,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  CloudRainWind,
  CloudSnow,
  Snowflake,
  CloudLightning,
  CloudHail,
  Cloud,
  type LucideIcon,
} from "lucide-react";
import type { WeatherIconName } from "@/mastra/shared";

export type WeatherProps = {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windGust: number;
  conditions: string;
  location: string;
  icon: WeatherIconName;
};

const ICON_MAP: Record<WeatherIconName, LucideIcon> = {
  sun: Sun,
  "cloud-sun": CloudSun,
  cloudy: Cloudy,
  "cloud-fog": CloudFog,
  "cloud-drizzle": CloudDrizzle,
  "cloud-rain": CloudRain,
  "cloud-rain-wind": CloudRainWind,
  "cloud-snow": CloudSnow,
  snowflake: Snowflake,
  "cloud-lightning": CloudLightning,
  "cloud-hail": CloudHail,
  cloud: Cloud,
};

export const Weather = ({
  temperature,
  feelsLike,
  humidity,
  windSpeed,
  windGust,
  conditions,
  location,
  icon,
}: WeatherProps) => {
  const IconComponent = ICON_MAP[icon];
  return (
    <div className="max-w-md mx-auto bg-linear-to-br from-blue-500 to-blue-700 rounded-2xl shadow-xl p-4 text-white">
      <div className="flex flex-row justify-between items-start">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <IconComponent className="w-14 h-14" />
            <div>
              <div className="text-2xl font-bold">{temperature}°C</div>
              <div className="text-lg opacity-90">{conditions}</div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="w-5 h-5" />
          <h2 className="text-xl font-bold">{location}</h2>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/20">
        <div className="flex items-center gap-3">
          <Thermometer className="w-5 h-5 opacity-80" />
          <div>
            <div className="text-sm opacity-80">Feels Like</div>
            <div className="text-lg font-semibold">{feelsLike}°C</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Droplets className="w-5 h-5 opacity-80" />
          <div>
            <div className="text-sm opacity-80">Humidity</div>
            <div className="text-lg font-semibold">{humidity}%</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Wind className="w-5 h-5 opacity-80" />
          <div>
            <div className="text-sm opacity-80">Wind Speed</div>
            <div className="text-lg font-semibold">{windSpeed} km/h</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Gauge className="w-5 h-5 opacity-80" />
          <div>
            <div className="text-sm opacity-80">Wind Gust</div>
            <div className="text-lg font-semibold">{windGust} km/h</div>
          </div>
        </div>
      </div>
    </div>
  );
};
