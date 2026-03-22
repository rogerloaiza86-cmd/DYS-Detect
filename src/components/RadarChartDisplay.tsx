"use client";

import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip } from "recharts";
import { MarkerScore } from "@/lib/types";

interface RadarChartDisplayProps {
  data: MarkerScore[];
}

export default function RadarChartDisplay({ data }: RadarChartDisplayProps) {
  const chartData = data.map(item => ({
    subject: item.name.split(' ')[0],
    A: item.score,
    fullMark: 100,
  }));

  return (
    <div className="w-full h-80 min-h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
          <PolarGrid stroke="#dee3e6" />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fill: '#005498', fontSize: 13, fontFamily: 'Lexend, sans-serif', fontWeight: 700 }} 
          />
          <PolarRadiusAxis 
            angle={90} 
            domain={[0, 100]} 
            tick={{ fill: '#767c7e', fontSize: 10 }}
            tickCount={5}
          />
          <Tooltip 
            contentStyle={{ borderRadius: '16px', border: '1px solid #ebeef0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontFamily: 'Inter, sans-serif' }}
          />
          <Radar
            name="Score de Risque"
            dataKey="A"
            stroke="#0060ad"
            fill="#0060ad"
            fillOpacity={0.2}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
