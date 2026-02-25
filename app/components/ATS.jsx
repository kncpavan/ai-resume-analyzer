import { cn } from "~/lib/utils";

const ATS = ({ score, suggestions }) => {
    return (
        <div className="bg-white rounded-2xl shadow-md w-full p-4">
            <h2 className="text-2xl font-bold mb-4">ATS Compatibility</h2>
            
            <div className="flex items-center gap-4 mb-4">
                <div className="text-4xl font-bold">{score}%</div>
                <div className={cn(
                    "px-3 py-1 rounded-full text-sm font-medium",
                    score > 70 ? "bg-green-100 text-green-700" :
                    score > 50 ? "bg-yellow-100 text-yellow-700" :
                    "bg-red-100 text-red-700"
                )}>
                    {score > 70 ? "Good" : score > 50 ? "Needs Improvement" : "Poor"}
                </div>
            </div>

            <div className="space-y-2">
                {suggestions && suggestions.map((suggestion, index) => (
                    <div
                        key={index}
                        className={cn(
                            "flex items-start gap-2 p-3 rounded-lg",
                            suggestion.type === "good" ? "bg-green-50" : "bg-yellow-50"
                        )}
                    >
                        <img
                            src={suggestion.type === "good" ? "/icons/check.svg" : "/icons/warning.svg"}
                            alt={suggestion.type}
                            className="w-5 h-5 mt-0.5"
                        />
                        <p className="text-sm">{suggestion.tip}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ATS;
