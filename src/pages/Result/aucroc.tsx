import { Line, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, Area } from "recharts"
import { AucRocData } from "@/types"

import {
    Card,
    CardContent,
    CardFooter,
} from "@/components/ui/card"
import {
    ChartConfig,
    ChartContainer,
} from "@/components/ui/chart"

const chartConfig = {
    desktop: {
        label: "Desktop",
        color: "var(--chart-1)",
    },
} satisfies ChartConfig

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload
        return (
            <div className="flex flex-col gap-1 rounded-md bg-background px-3 py-2 shadow-sm border text-xs w-max">
                <div className="flex justify-between gap-4 text-muted-foreground">
                    <span>FPR</span>
                    <span className="text-foreground font-medium">{data.fpr.toFixed(3)}</span>
                </div>
                <div className="flex justify-between gap-4 text-muted-foreground">
                    <span>TPR</span>
                    <span className="text-foreground font-medium">{data.tpr.toFixed(3)}</span>
                </div>
            </div>
        )
    }
    return null
}

export const ChartAucRoc: React.FC<{ data: AucRocData }> = ({ data }) => {
    // Prepare data for the chart
    const chartData = data.fpr.map((fpr, i) => ({
        fpr,
        tpr: data.tpr[i],
        diagonal: fpr, // Reference diagonal line (random classifier)
    }));

    return (
        <Card className="flex flex-col bg-transparent pt-6 w-full p-0">
            <CardContent className="p-0 pb-4">
                <ChartContainer config={chartConfig}>
                    <ComposedChart
                        height={1000}
                        data={chartData}
                        margin={{
                            top: 10,
                            right: 10,
                            bottom: 20,
                            left: 0,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                            dataKey="fpr"
                            name="False Positive Rate"
                            type="number"
                            domain={[0, 1]}
                            ticks={[0, 0.2, 0.4, 0.6, 0.8, 1]}
                            label={{ value: "False Positive Rate", position: "bottom", fill: "white", fontSize: 14, dx:-20 }}
                            tick={{ fill: "white", opacity: 0.7 }}
                        />
                        <YAxis
                            dataKey="tpr"
                            name="True Positive Rate"
                            type="number"
                            domain={[0, 1]}
                            ticks={[0, 0.2, 0.4, 0.6, 0.8, 1]}
                            label={{
                                value: "True Positive Rate",
                                angle: -90,
                                position: "insideLeft",
                                fill: "white",
                                fontSize: 14,
                                dy: 60,
                            }}
                            tick={{ fill: "white", opacity: 0.7 }}
                        />
                        <Tooltip
                            cursor={{ strokeDasharray: "3 3" }}
                            content={<CustomTooltip />}
                        />
                        <Area
                            type="monotone"
                            dataKey="tpr"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            fill="#3b82f6"
                            fillOpacity={0.2}
                        />
                        <Line
                            type="monotone"
                            dataKey="diagonal"
                            stroke="#ef4444"
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            dot={false}
                        />
                    </ComposedChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="py-6 pt-10 p-0">
                <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap gap-x-6 gap-y-2">
                        <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-[#3b82f6]" />
                            <span className="text-xs text-white/60">ROC Curve</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-[3px] w-6 border-t-[3px] border-dashed border-[#ef4444]" />
                            <span className="text-xs text-white/60">Random Classifier</span>
                        </div>
                    </div>
                    <div className="mt-2 text-sm font-medium text-white">
                        AUC Score: {data.auc.toFixed(3)}
                    </div>
                </div>
            </CardFooter>
        </Card>
    )
}