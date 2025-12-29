"use client";

import { cn } from "@/lib/utils";
import {
  CloudIcon,
  CloudRainIcon,
  CloudSnowIcon,
  SunIcon,
  CloudSunIcon,
  WindIcon,
  ThermometerIcon,
  DropletIcon,
} from "lucide-react";
import type { HTMLAttributes } from "react";

export type WeatherData = {
  location: string;
  temperature: number;
  condition: "sunny" | "cloudy" | "rainy" | "snowy" | "partly-cloudy" | "windy";
  humidity: number;
  windSpeed: number;
  feelsLike: number;
  high: number;
  low: number;
};

export type WeatherProps = HTMLAttributes<HTMLDivElement> & WeatherData;

const weatherIcons = {
  sunny: SunIcon,
  cloudy: CloudIcon,
  rainy: CloudRainIcon,
  snowy: CloudSnowIcon,
  "partly-cloudy": CloudSunIcon,
  windy: WindIcon,
};

const weatherLabels: Record<WeatherData["condition"], string> = {
  sunny: "맑음",
  cloudy: "흐림",
  rainy: "비",
  snowy: "눈",
  "partly-cloudy": "구름 조금",
  windy: "바람",
};

const weatherGradients: Record<WeatherData["condition"], string> = {
  sunny: "from-yellow-400 to-orange-500",
  cloudy: "from-gray-400 to-gray-600",
  rainy: "from-blue-400 to-blue-600",
  snowy: "from-blue-100 to-blue-300",
  "partly-cloudy": "from-blue-300 to-yellow-400",
  windy: "from-teal-400 to-cyan-500",
};

export const Weather = ({
  className,
  location,
  temperature,
  condition,
  humidity,
  windSpeed,
  feelsLike,
  high,
  low,
  ...props
}: WeatherProps) => {
  const WeatherIcon = weatherIcons[condition];

  return (
    <div
      className={cn(
        "w-full max-w-sm overflow-hidden rounded-2xl bg-gradient-to-br shadow-lg",
        weatherGradients[condition],
        className
      )}
      {...props}
    >
      <div className="p-6 text-white">
        {/* Location */}
        <div className="mb-4">
          <h3 className="font-semibold text-lg opacity-90">{location}</h3>
          <p className="text-sm opacity-75">{weatherLabels[condition]}</p>
        </div>

        {/* Main Temperature */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-end gap-1">
            <span className="font-bold text-6xl">{temperature}</span>
            <span className="mb-2 text-2xl">°C</span>
          </div>
          <WeatherIcon className="size-20 opacity-90" />
        </div>

        {/* High/Low */}
        <div className="mb-4 flex gap-4 text-sm">
          <span className="opacity-90">최고: {high}°</span>
          <span className="opacity-90">최저: {low}°</span>
        </div>

        {/* Details */}
        <div className="grid grid-cols-3 gap-4 rounded-xl bg-white/20 p-4 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-1">
            <ThermometerIcon className="size-5 opacity-80" />
            <span className="text-xs opacity-75">체감</span>
            <span className="font-medium text-sm">{feelsLike}°</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <DropletIcon className="size-5 opacity-80" />
            <span className="text-xs opacity-75">습도</span>
            <span className="font-medium text-sm">{humidity}%</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <WindIcon className="size-5 opacity-80" />
            <span className="text-xs opacity-75">바람</span>
            <span className="font-medium text-sm">{windSpeed}m/s</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export type WeatherSkeletonProps = HTMLAttributes<HTMLDivElement>;

export const WeatherSkeleton = ({
  className,
  ...props
}: WeatherSkeletonProps) => (
  <div
    className={cn(
      "w-full max-w-sm overflow-hidden rounded-2xl bg-gradient-to-br from-gray-200 to-gray-300 shadow-lg dark:from-gray-700 dark:to-gray-800",
      className
    )}
    {...props}
  >
    <div className="animate-pulse p-6">
      <div className="mb-4">
        <div className="mb-2 h-5 w-24 rounded bg-white/30" />
        <div className="h-4 w-16 rounded bg-white/20" />
      </div>
      <div className="mb-6 flex items-center justify-between">
        <div className="h-16 w-24 rounded bg-white/30" />
        <div className="size-20 rounded-full bg-white/20" />
      </div>
      <div className="mb-4 flex gap-4">
        <div className="h-4 w-16 rounded bg-white/20" />
        <div className="h-4 w-16 rounded bg-white/20" />
      </div>
      <div className="grid grid-cols-3 gap-4 rounded-xl bg-white/10 p-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <div className="size-5 rounded bg-white/20" />
            <div className="h-3 w-8 rounded bg-white/20" />
            <div className="h-4 w-10 rounded bg-white/20" />
          </div>
        ))}
      </div>
    </div>
  </div>
);
