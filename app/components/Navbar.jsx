import { Link } from "react-router";

const Navbar = () => {
    return (
        <nav className="navbar">
            <Link to="/">
                <p className="text-2xl font-bold text-gradient">JobFit AI</p>
            </Link>
            <div className="flex flex-row gap-4">
                <Link to="/builder" className="primary-button w-fit">
                    Create Resume
                </Link>
                <Link to="/upload" className="primary-button w-fit">
                    Upload Resume
                </Link>
            </div>
        </nav>
    );
};

export default Navbar;

