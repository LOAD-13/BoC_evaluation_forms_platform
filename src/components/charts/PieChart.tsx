"use client"

import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts"

interface PieChartProps {
    data: {
        name: string
        value: number
        color: string
    }[]
}

export function PieChart({ data }: PieChartProps) {
    return (
        <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{ backgroundColor: "#fff", borderRadius: "8px", border: "1px solid #e2e8f0" }}
                        itemStyle={{ color: "#1e293b" }}
                    />
                    <Legend verticalAlign="bottom" height={36} />
                </RechartsPieChart>
            </ResponsiveContainer>
        </div>
    )
}