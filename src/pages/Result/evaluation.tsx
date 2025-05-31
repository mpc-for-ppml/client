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

const CustomScatterTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload
        return (
            <div className="flex flex-col gap-1 rounded-md bg-background px-3 py-2 shadow-sm border text-xs w-max">
                <div className="flex justify-between gap-4 text-muted-foreground">
                    <span>Actual</span>
                    <span className="text-foreground font-medium">{data.actual.toFixed(2)}</span>
                </div>
                <div className="flex justify-between gap-4 text-muted-foreground">
                    <span>Predicted</span>
                    <span className="text-foreground font-medium">{data.predicted.toFixed(2)}</span>
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
    // Add regression line data to each point
    const dataWithRegression = scatterData.map(point => ({
        ...point,
        regression: a * point.actual + b,
    }));

    // Add y=x reference line data to each point
    const dataWithRegressionAndReference = dataWithRegression.map(point => ({
        ...point,
        reference: point.actual, // y=x line
    }));

    return (
        <Card className="flex flex-col bg-transparent pt-6 w-full p-0">
            <CardContent className="p-0 pb-4">
                <ChartContainer config={chartConfig}>
                    <ComposedChart
                        height={1000}
                        data={dataWithRegressionAndReference}
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
                            label={{ value: "Actual", position: "bottom", fill: "white", fontSize: 14, dx:-20 }}
                            tick={{ fill: "white" }}
                        />
                        <YAxis
                            dataKey="predicted"
                            name="Predicted"
                            label={{
                                value: "Predicted",
                                angle: -90,
                                position: "insideLeft",
                                fill: "white",
                                fontSize: 14,
                                dy: 20,
                            }}
                            tick={{ fill: "white" }}
                        />
                        <Tooltip
                            cursor={{ strokeDasharray: "3 3" }}
                            content={<CustomScatterTooltip />}
                        />
                        <Scatter
                            name="Prediction"
                            data={dataWithRegressionAndReference}
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