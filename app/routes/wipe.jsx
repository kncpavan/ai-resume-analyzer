import { usePuterStore } from "~/lib/puter";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import Navbar from "~/components/Navbar";

export function meta() {
    return [
        { title: "Wipe Data | Resumind" },
        { name: "description", content: "Clear all your resume data" },
    ];
}

const Wipe = () => {
    const { auth, isLoading, kv } = usePuterStore();
    const navigate = useNavigate();
    const [isWiping, setIsWiping] = useState(false);
    const [statusText, setStatusText] = useState('');

    useEffect(() => {
        if (!isLoading && !auth.isAuthenticated) {
            navigate('/auth?next=/wipe');
        }
    }, [isLoading, auth.isAuthenticated, navigate]);

    const handleWipe = async () => {
        try {
            setIsWiping(true);
            setStatusText('Clearing all data...');
            
            await kv.flush();
            
            setStatusText('All data cleared successfully!');
            setTimeout(() => {
                navigate('/');
            }, 2000);
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : String(err);
            setStatusText(`Error: ${errorMsg}`);
            setIsWiping(false);
        }
    };

    if (isWiping) {
        return (
            <main className="bg-[url('/images/bg-main.svg')] bg-cover">
                <Navbar />
                <section className="main-section">
                    <div className="page-heading py-16">
                        <h1>Clearing Data</h1>
                        <h2>{statusText}</h2>
                        <img src="/images/resume-scan.gif" className="w-full" />
                    </div>
                </section>
            </main>
        );
    }

    return (
        <main className="bg-[url('/images/bg-main.svg')] bg-cover">
            <Navbar />

            <section className="main-section">
                <div className="page-heading py-16">
                    <h1>Clear All Data</h1>
                    <h2>This will permanently delete all your saved resumes and feedback.</h2>
                    
                    <div className="flex flex-col gap-4 mt-8 items-center">
                        <button
                            onClick={handleWipe}
                            className="primary-button bg-red-500 hover:bg-red-600"
                        >
                            Delete All Data
                        </button>
                        
                        <Link to="/" className="text-gray-500 hover:text-gray-700">
                            Cancel and go back
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default Wipe;
