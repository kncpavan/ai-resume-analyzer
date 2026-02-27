const ScoreGauge = ({ score = 75 }) => {
    const getScoreColor = (score) => {
        if (score > 70) return "#22c55e";
        if (score > 49) return "#eab308";
        return "#ef4444";
    };

    const getGradientId = (score) => {
        if (score > 70) return "gauge-grad-good";
        if (score > 49) return "gauge-grad-warning";
        return "gauge-grad-bad";
    };

    const scoreColor = getScoreColor(score);
    const gradientId = getGradientId(score);

    // Calculate the dash array for the progress
    const radius = 80;
    const circumference = 2 * Math.PI * radius;
    const progress = score / 100;
    const strokeDashoffset = circumference * (1 - progress);

    return (
        <div className="relative w-[180px] h-[180px]">
            <svg
                width="180"
                height="180"
                viewBox="0 0 180 180"
                className="transform -rotate-90"
            >
                <defs>
                    <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor={scoreColor} stopOpacity="0.5" />
                        <stop offset="100%" stopColor={scoreColor} />
                    </linearGradient>
                </defs>
                
                {/* Background circle */}
                <circle
                    cx="90"
                    cy="90"
                    r={radius}
                    stroke="#e5e7eb"
                    strokeWidth="12"
                    fill="none"
                />
                
                {/* Progress circle */}
                <circle
                    cx="90"
                    cy="90"
                    r={radius}
                    stroke={`url(#${gradientId})`}
                    strokeWidth="12"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-1000 ease-out"
                />
            </svg>

            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-bold" style={{ color: scoreColor }}>
                    {score}
                </span>
                <span className="text-gray-500 text-sm">/100</span>
            </div>
        </div>
    );
};

export default ScoreGauge;
