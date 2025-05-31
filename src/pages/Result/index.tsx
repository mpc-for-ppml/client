import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useParams } from "react-router-dom";
import Plot from "react-plotly.js";

const dummyData = {
    summary: {
        model: "Linear Regression",
        dataset: "User Purchase Dataset",
        trainingTime: "2.3s",
        iterations: 12,
        finalLoss: 1382.12,
        r2: 0.87,
    },
    coefficients: [
        { feature: "age", value: 3.12 },
        { feature: "income", value: 0.52 },
        { feature: "web_visits", value: 1.87 },
    ],
    actualVsPredicted: {
        actual: [100, 150, 200, 250, 300, 350],
        predicted: [110, 145, 195, 260, 310, 340],
    },
};

export const Result: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { summary, coefficients, actualVsPredicted } = dummyData;

    // validate sessionId valid

    return (
        <motion.div
            className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <Card className="col-span-1 md:col-span-2">
                <CardContent className="p-6">
                    <h1 className="text-2xl font-semibold mb-2">Linear Regression Result</h1>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                        <div>
                            <span className="block font-medium text-foreground">Model</span>
                            {summary.model}
                        </div>
                        <div>
                            <span className="block font-medium text-foreground">Dataset</span>
                            {summary.dataset}
                        </div>
                        <div>
                            <span className="block font-medium text-foreground">Training Time</span>
                            {summary.trainingTime}
                        </div>
                        <div>
                            <span className="block font-medium text-foreground">Iterations</span>
                            {summary.iterations}
                        </div>
                        <div>
                            <span className="block font-medium text-foreground">Final Loss</span>
                            {summary.finalLoss}
                        </div>
                        <div>
                            <span className="block font-medium text-foreground">R² Score</span>
                            {summary.r2}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-6">
                    <h2 className="text-lg font-semibold mb-4">Model Coefficients</h2>
                    <ul className="space-y-2 text-sm">
                        {coefficients.map((c) => (
                            <li key={c.feature} className="flex justify-between">
                                <span className="capitalize">{c.feature}</span>
                                <span>{c.value.toFixed(4)}</span>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-6">
                    <h2 className="text-lg font-semibold mb-4">Actual vs Predicted</h2>
                    <Plot
                        data={[
                            {
                                x: actualVsPredicted.actual,
                                y: actualVsPredicted.predicted,
                                mode: "markers",
                                type: "scatter",
                                marker: { color: "#3b82f6", size: 8 },
                                text: actualVsPredicted.actual.map(
                                    (val, i) => `Actual: ${val}<br>Predicted: ${actualVsPredicted.predicted[i]}`
                                ),
                                hoverinfo: "text",
                            },
                        ]}
                        layout={{
                            title: { text: "Actual vs Predicted" },
                            xaxis: { title: { text: "Actual" } },
                            yaxis: { title: { text: "Predicted" } },
                            margin: { t: 40, l: 40, r: 20, b: 40 },
                        }}
                        useResizeHandler
                        style={{ width: "100%", height: "400px" }}
                        config={{ responsive: true }}
                    />
                </CardContent>
            </Card>
        </motion.div>
    );
}
