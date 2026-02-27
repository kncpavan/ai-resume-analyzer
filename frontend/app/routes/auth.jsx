import { usePuterStore } from "~/lib/puter";
import { useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";

export function meta() {
    return [
        { title: "Authenticate | Resumind" },
        { name: "description", content: "Sign in to continue" },
    ];
}

const Auth = () => {
    const { auth, isLoading } = usePuterStore();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const next = searchParams.get("next") || "/";

    useEffect(() => {
        if (!isLoading && auth.isAuthenticated) {
            navigate(next);
        }
    }, [isLoading, auth.isAuthenticated, navigate, next]);

    const handleSignIn = async () => {
        await auth.signIn();
        navigate(next);
    };

    if (isLoading) {
        return (
            <main className="bg-[url('/images/bg-auth.svg')] bg-cover min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center justify-center">
                    <img src="/images/resume-scan-2.gif" className="w-[200px]" />
                </div>
            </main>
        );
    }

    return (
        <main className="bg-[url('/images/bg-auth.svg')] bg-cover min-h-screen flex items-center justify-center">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gradient mb-2">RESUMIND</h1>
                    <p className="text-gray-600">Smart feedback for your dream job!</p>
                </div>

                <div className="space-y-4">
                    <button
                        onClick={handleSignIn}
                        className="w-full primary-button py-3 px-4 text-lg font-semibold"
                    >
                        Sign in with Puter.ai
                    </button>

                    <div className="text-center text-sm text-gray-500">
                        <p>Sign in to save your resume analysis</p>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <Link to="/" className="text-gray-500 hover:text-gray-700">
                        Back to Home
                    </Link>
                </div>
            </div>
        </main>
    );
};

export default Auth;
