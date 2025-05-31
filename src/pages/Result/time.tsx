import * as React from "react"
import { Label, Pie, PieChart, Sector } from "recharts"
import { PieSectorDataItem } from "recharts/types/polar/Pie"
import { TimeData } from "@/types"

import {
    Card,
    CardContent,
    CardHeader,
} from "@/components/ui/card"
import {
    ChartConfig,
    ChartContainer,
    ChartStyle,
    ChartTooltip,
} from "@/components/ui/chart"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

const chartConfig = {
    time: {
        label: "Time",
    }
} satisfies ChartConfig

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload
        return (
            <div className="flex items-center gap-2 rounded-md bg-background px-3 py-2 shadow-sm border w-max">
                {/* Colored Dot */}
                <div
                    className="h-3 w-3 rounded-lg"
                    style={{ backgroundColor: data.fill }}
                />

                {/* Phase Name */}
                <span className="text-xs text-muted-foreground">
                    {data.phase}
                </span>

                {/* Spacer */}
                <span className="mx-1 text-muted-foreground">•</span>

                {/* Time Value */}
                <span className="text-xs font-medium text-foreground">
                    {data.time.toLocaleString()}s
                </span>
            </div>
        )
    }

    return null
}

export const ChartPieInteractive: React.FC<{ timeData: TimeData[] }> = ({ timeData }) => {
    const id = "pie-interactive"
    const [activePhase, setActivePhase] = React.useState(timeData[0].phase)

    const activeIndex = React.useMemo(
        () => timeData.findIndex((item) => item.phase === activePhase),
        [activePhase]
    )

    return (
        <Card data-chart={id} className="flex bg-transparent flex-col pb-0">
            <ChartStyle id={id} config={chartConfig} />
            <CardHeader className="flex-row items-start space-y-0 p-0">
                <Select value={activePhase} onValueChange={setActivePhase}>
                    <SelectTrigger
                        className="ml-auto h-7 w-[220px] rounded-lg pl-2.5 bg-white"
                        aria-label="Select a value"
                    >
                        <SelectValue placeholder="Select phase" />
                    </SelectTrigger>
                    <SelectContent align="end" className="rounded-xl">
                        {timeData.map((item) => (
                            <SelectItem
                                key={item.phase}
                                value={item.phase}
                                className="rounded-lg [&_span]:flex bg-white"
                            >
                                <div className="flex items-center gap-2 text-xs">
                                    <span
                                        className="flex h-3 w-3 shrink-0 rounded-xs"
                                        style={{ backgroundColor: item.fill }}
                                    />
                                    {item.phase}
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </CardHeader>
            <CardContent className="flex flex-1 justify-center p-0 pt-4">
                <ChartContainer
                    id={id}
                    config={chartConfig}
                    className="mx-auto aspect-square w-full min-h-[325px]"
                >
                    <PieChart>
                        <ChartTooltip
                            cursor={false}
                            content={<CustomTooltip />}
                        />
                        <Pie
                            data={timeData}
                            dataKey="time"
                            nameKey="phase"
                            innerRadius={65}
                            strokeWidth={5}
                            activeIndex={activeIndex}
                            activeShape={({
                                outerRadius = 0,
                                ...props
                            }: PieSectorDataItem) => (
                                <g>
                                    <Sector {...props} outerRadius={outerRadius + 10} />
                                    <Sector
                                        {...props}
                                        outerRadius={outerRadius + 25}
                                        innerRadius={outerRadius + 12}
                                    />
                                </g>
                            )}
                        >
                            <Label
                                content={({ viewBox }) => {
                                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                        return (
                                            <text
                                                x={viewBox.cx}
                                                y={viewBox.cy}
                                                textAnchor="middle"
                                                dominantBaseline="middle"
                                                className="fill-white"
                                            >
                                                <tspan className="text-3xl font-bold" x={viewBox.cx} dy="-0.2em">
                                                    {timeData[activeIndex].time.toLocaleString()}
                                                </tspan>
                                                <tspan className="text-sm" x={viewBox.cx} dy="1.6em">
                                                    Seconds
                                                </tspan>
                                            </text>
                                        )
                                    }
                                    return null
                                }}
                            />
                        </Pie>
                    </PieChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
