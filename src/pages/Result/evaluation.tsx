import { Scatter, Line, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"
import { ActualvsPredicted } from "@/types"

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

// Format large numbers with scientific notation
const formatNumber = (num: number): string => {
    if (Math.abs(num) >= 1e6) {
        return num.toExponential(2);
    } else if (Math.abs(num) >= 1000) {
        return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
    }
    return num.toFixed(2);
}

const CustomScatterTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload
        return (
            <div className="flex flex-col gap-1 rounded-md bg-background px-3 py-2 shadow-sm border text-xs w-max">
                <div className="flex justify-between gap-4 text-muted-foreground">
                    <span>Actual</span>
                    <span className="text-foreground font-medium">{formatNumber(data.actual)}</span>
                </div>
                <div className="flex justify-between gap-4 text-muted-foreground">
                    <span>Predicted</span>
                    <span className="text-foreground font-medium">{formatNumber(data.predicted)}</span>
                </div>
            </div>
        )
    }
    return null
}

function computeLinearRegression(xs: number[], ys: number[]) {
    const n = xs.length;
    const meanX = xs.reduce((sum, x) => sum + x, 0) / n;
    const meanY = ys.reduce((sum, y) => sum + y, 0) / n;

    const numerator = xs.reduce((sum, x, i) => sum + (x - meanX) * (ys[i] - meanY), 0);
    const denominator = xs.reduce((sum, x) => sum + (x - meanX) ** 2, 0);

    const a = numerator / denominator; // slope
    const b = meanY - a * meanX;       // intercept

    return { a, b };
}

export const ChartLineLinear: React.FC<{ data: ActualvsPredicted }> = ({ data }) => {
    const scatterData = data.actual.map((actual, i) => ({
        actual,
        predicted: data.predicted[i],
    }));

    const { a, b } = computeLinearRegression(data.actual, data.predicted);
    
    // Sort the scatter data by actual values
    const sortedData = [...scatterData].sort((a, b) => a.actual - b.actual);
    
    // Add reference line and regression values to data
    const chartData = sortedData.map((point, index) => ({
        ...point,
        reference: point.actual, // y=x line
        // Only add regression values to first and last points for a straight line
        regression: (index === 0 || index === sortedData.length - 1) 
            ? a * point.actual + b 
            : undefined
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
                            dataKey="actual"
                            name="Actual"
                            type="number"
                            domain={['dataMin', 'dataMax']}
                            label={{ value: "Actual", position: "bottom", fill: "white", fontSize: 14, dx:-20 }}
                            tick={{ fill: "white", opacity: 0.7 }}
                            tickFormatter={formatNumber}
                        />
                        <YAxis
                            dataKey="predicted"
                            name="Predicted"
                            type="number"
                            domain={['dataMin', 'dataMax']}
                            label={{
                                value: "Predicted",
                                angle: -90,
                                position: "insideLeft",
                                fill: "white",
                                fontSize: 14,
                                dy: 20,
                            }}
                            tick={{ fill: "white", opacity: 0.7 }}
                            tickFormatter={formatNumber}
                        />
                        <Tooltip
                            cursor={{ strokeDasharray: "3 3" }}
                            content={<CustomScatterTooltip />}
                        />
                        <Scatter
                            name="Prediction"
                            data={chartData}
                            fill="#3b82f6"
                            shape="circle"
                        />
                        <Line
                            type="monotone"
                            dataKey="regression"
                            stroke="#f59e0b"
                            strokeWidth={2}
                            dot={false}
                            connectNulls
                        />
                        <Line
                            type="monotone"
                            dataKey="reference"
                            stroke="#10b981"
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            dot={false}
                            connectNulls
                        />
                    </ComposedChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="py-6 pt-10 p-0">
                <div className="flex flex-wrap gap-x-6 gap-y-2">
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-[#3b82f6]" />
                        <span className="text-xs text-white/60">Actual vs Predicted</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-[3px] w-6 bg-[#f59e0b]" />
                        <span className="text-xs text-white/60">Linear Regression</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-[3px] w-6 border-t-[3px] border-dashed border-[#10b981]" />
                        <span className="text-xs text-white/60">Perfect Prediction (y=x)</span>
                    </div>
                </div>
            </CardFooter>
        </Card>
    )
}