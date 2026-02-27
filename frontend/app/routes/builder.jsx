import { useState } from "react";
import Navbar from "~/components/Navbar";
import { resumeTemplates } from "../../constants/resumeTemplates";

export const meta = () => ([
    { title: 'JobFit AI - Create Resume' },
    { name: 'description', content: 'Create your professional resume with our templates' },
]);

const Builder = () => {
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [step, setStep] = useState("select");
    const [resumeData, setResumeData] = useState({
        fullName: "",
        email: "",
        phone: "",
        location: "",
        linkedin: "",
        github: "",
        portfolio: "",
        summary: "",
        skills: "",
        experience: [{ company: "", role: "", duration: "", description: "" }],
        education: [{ school: "", degree: "", year: "", gpa: "" }],
        projects: [{ name: "", description: "", technologies: "" }],
    });

    const handleTemplateSelect = (template) => {
        setSelectedTemplate(template);
        setStep("fill");
    };

    const handleInputChange = (field, value) => {
        setResumeData(prev => ({ ...prev, [field]: value }));
    };

    const handleArrayFieldChange = (arrayName, index, field, value) => {
        setResumeData(prev => {
            const newArray = [...prev[arrayName]];
            newArray[index] = { ...newArray[index], [field]: value };
            return { ...prev, [arrayName]: newArray };
        });
    };

    const addArrayItem = (arrayName, defaultItem) => {
        setResumeData(prev => ({
            ...prev,
            [arrayName]: [...prev[arrayName], defaultItem]
        }));
    };

    const removeArrayItem = (arrayName, index) => {
        setResumeData(prev => ({
            ...prev,
            [arrayName]: prev[arrayName].filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setStep("preview");
    };

    const goBack = () => {
        if (step === "preview") setStep("fill");
        else if (step === "fill") {
            setStep("select");
            setSelectedTemplate(null);
        }
    };

    return (
        <main className="bg-[url('/images/bg-main.svg')] bg-cover min-h-screen">
            <Navbar />
            
            <section className="main-section">
                <div className="page-heading py-8">
                    <h1>Create Your Resume</h1>
                    {step === "select" && (
                        <h2>Choose a template to get started</h2>
                    )}
                    {step === "fill" && selectedTemplate && (
                        <h2>Fill in your details</h2>
                    )}
                    {step === "preview" && (
                        <h2>Preview Your Resume</h2>
                    )}
                </div>

                {step === "select" && (
                    <TemplateSelector
                        templates={resumeTemplates}
                        onSelect={handleTemplateSelect}
                    />
                )}

                {step === "fill" && selectedTemplate && (
                    <ResumeForm
                        template={selectedTemplate}
                        resumeData={resumeData}
                        onChange={handleInputChange}
                        onArrayChange={handleArrayFieldChange}
                        onAdd={addArrayItem}
                        onRemove={removeArrayItem}
                        onSubmit={handleSubmit}
                        onBack={goBack}
                    />
                )}

                {step === "preview" && selectedTemplate && (
                    <ResumePreview
                        template={selectedTemplate}
                        resumeData={resumeData}
                        onBack={goBack}
                    />
                )}
            </section>
        </main>
    );
};

// Simple Template Selection
const TemplateSelector = ({ templates, onSelect }) => {
    return (
        <div className="w-full max-w-6xl px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map(template => (
                    <TemplateCard
                        key={template.id}
                        template={template}
                        onSelect={onSelect}
                    />
                ))}
            </div>
        </div>
    );
};

// Template Card
const TemplateCard = ({ template, onSelect }) => {
    const handleUseTemplate = () => {
        console.log("Template selected:", template.id);
        onSelect(template);
    };

    return (
        <div
            className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all border-2 border-transparent hover:border-indigo-500"
        >
            <div
                className="h-40 rounded-lg mb-4 flex items-center justify-center text-white font-bold text-2xl"
                style={{ backgroundColor: template.style.primaryColor }}
            >
                {template.name.split(" - ")[0]}
            </div>

            <h3 className="text-xl font-bold text-gray-800 mb-2">{template.name}</h3>
            <p className="text-gray-600 text-sm mb-4">{template.description}</p>

            <button
                type="button"
                className="w-full mt-4 primary-button"
                onClick={handleUseTemplate}
            >
                Use Template
            </button>
        </div>
    );
};

// Resume Form with all fields
const ResumeForm = ({ template, resumeData, onChange, onArrayChange, onAdd, onRemove, onSubmit, onBack }) => {
    return (
        <form onSubmit={onSubmit} className="w-full max-w-4xl bg-white rounded-2xl p-8 shadow-lg mx-auto mb-8">
            {/* Personal Information */}
            <div className="mb-8">
                <h3 className="text-2xl font-bold mb-4 text-gray-800">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-div">
                        <label>Full Name</label>
                        <input 
                            type="text" 
                            value={resumeData.fullName}
                            onChange={(e) => onChange("fullName", e.target.value)}
                            placeholder="John Doe"
                            required
                        />
                    </div>
                    <div className="form-div">
                        <label>Email</label>
                        <input 
                            type="email" 
                            value={resumeData.email}
                            onChange={(e) => onChange("email", e.target.value)}
                            placeholder="john@example.com"
                            required
                        />
                    </div>
                    <div className="form-div">
                        <label>Phone</label>
                        <input 
                            type="tel" 
                            value={resumeData.phone}
                            onChange={(e) => onChange("phone", e.target.value)}
                            placeholder="+1 (555) 123-4567"
                        />
                    </div>
                    <div className="form-div">
                        <label>Location</label>
                        <input 
                            type="text" 
                            value={resumeData.location}
                            onChange={(e) => onChange("location", e.target.value)}
                            placeholder="San Francisco, CA"
                        />
                    </div>
                    <div className="form-div">
                        <label>LinkedIn</label>
                        <input 
                            type="text" 
                            value={resumeData.linkedin}
                            onChange={(e) => onChange("linkedin", e.target.value)}
                            placeholder="linkedin.com/in/johndoe"
                        />
                    </div>
                    <div className="form-div">
                        <label>GitHub</label>
                        <input 
                            type="text" 
                            value={resumeData.github}
                            onChange={(e) => onChange("github", e.target.value)}
                            placeholder="github.com/johndoe"
                        />
                    </div>
                </div>
            </div>

            {/* Professional Summary */}
            <div className="mb-8">
                <h3 className="text-2xl font-bold mb-4 text-gray-800">Professional Summary</h3>
                <div className="form-div">
                    <textarea 
                        rows={4}
                        value={resumeData.summary}
                        onChange={(e) => onChange("summary", e.target.value)}
                        placeholder="Write a brief summary of your professional background and career goals..."
                    />
                </div>
            </div>

            {/* Skills */}
            <div className="mb-8">
                <h3 className="text-2xl font-bold mb-4 text-gray-800">Skills</h3>
                <div className="form-div">
                    <textarea 
                        rows={3}
                        value={resumeData.skills}
                        onChange={(e) => onChange("skills", e.target.value)}
                        placeholder="JavaScript, React, Node.js, Python, AWS, Docker..."
                    />
                </div>
            </div>

            {/* Experience */}
            <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-2xl font-bold text-gray-800">Experience</h3>
                    <button 
                        type="button"
                        onClick={() => onAdd("experience", { company: "", role: "", duration: "", description: "" })}
                        className="px-4 py-2 bg-indigo-100 text-indigo-600 rounded-lg font-medium hover:bg-indigo-200"
                    >
                        + Add Experience
                    </button>
                </div>
                {resumeData.experience.map((exp, index) => (
                    <div key={index} className="mb-6 p-4 bg-gray-50 rounded-xl">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="form-div">
                                <label>Company</label>
                                <input 
                                    type="text"
                                    value={exp.company}
                                    onChange={(e) => onArrayChange("experience", index, "company", e.target.value)}
                                    placeholder="Company Name"
                                />
                            </div>
                            <div className="form-div">
                                <label>Role</label>
                                <input 
                                    type="text"
                                    value={exp.role}
                                    onChange={(e) => onArrayChange("experience", index, "role", e.target.value)}
                                    placeholder="Job Title"
                                />
                            </div>
                            <div className="form-div">
                                <label>Duration</label>
                                <input 
                                    type="text"
                                    value={exp.duration}
                                    onChange={(e) => onArrayChange("experience", index, "duration", e.target.value)}
                                    placeholder="Jan 2020 - Present"
                                />
                            </div>
                        </div>
                        <div className="form-div">
                            <label>Description</label>
                            <textarea 
                                rows={3}
                                value={exp.description}
                                onChange={(e) => onArrayChange("experience", index, "description", e.target.value)}
                                placeholder="Describe your responsibilities and achievements..."
                            />
                        </div>
                        {resumeData.experience.length > 1 && (
                            <button 
                                type="button"
                                onClick={() => onRemove("experience", index)}
                                className="mt-2 text-red-500 text-sm hover:underline"
                            >
                                Remove
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {/* Education */}
            <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-2xl font-bold text-gray-800">Education</h3>
                    <button 
                        type="button"
                        onClick={() => onAdd("education", { school: "", degree: "", year: "", gpa: "" })}
                        className="px-4 py-2 bg-indigo-100 text-indigo-600 rounded-lg font-medium hover:bg-indigo-200"
                    >
                        + Add Education
                    </button>
                </div>
                {resumeData.education.map((edu, index) => (
                    <div key={index} className="mb-6 p-4 bg-gray-50 rounded-xl">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="form-div">
                                <label>School</label>
                                <input 
                                    type="text"
                                    value={edu.school}
                                    onChange={(e) => onArrayChange("education", index, "school", e.target.value)}
                                    placeholder="University Name"
                                />
                            </div>
                            <div className="form-div">
                                <label>Degree</label>
                                <input 
                                    type="text"
                                    value={edu.degree}
                                    onChange={(e) => onArrayChange("education", index, "degree", e.target.value)}
                                    placeholder="Bachelor of Science in Computer Science"
                                />
                            </div>
                            <div className="form-div">
                                <label>Year</label>
                                <input 
                                    type="text"
                                    value={edu.year}
                                    onChange={(e) => onArrayChange("education", index, "year", e.target.value)}
                                    placeholder="2016 - 2020"
                                />
                            </div>
                            <div className="form-div">
                                <label>GPA (Optional)</label>
                                <input 
                                    type="text"
                                    value={edu.gpa}
                                    onChange={(e) => onArrayChange("education", index, "gpa", e.target.value)}
                                    placeholder="3.8/4.0"
                                />
                            </div>
                        </div>
                        {resumeData.education.length > 1 && (
                            <button 
                                type="button"
                                onClick={() => onRemove("education", index)}
                                className="mt-2 text-red-500 text-sm hover:underline"
                            >
                                Remove
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {/* Projects */}
            <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-2xl font-bold text-gray-800">Projects</h3>
                    <button 
                        type="button"
                        onClick={() => onAdd("projects", { name: "", description: "", technologies: "" })}
                        className="px-4 py-2 bg-indigo-100 text-indigo-600 rounded-lg font-medium hover:bg-indigo-200"
                    >
                        + Add Project
                    </button>
                </div>
                {resumeData.projects.map((project, index) => (
                    <div key={index} className="mb-6 p-4 bg-gray-50 rounded-xl">
                        <div className="form-div mb-4">
                            <label>Project Name</label>
                            <input 
                                type="text"
                                value={project.name}
                                onChange={(e) => onArrayChange("projects", index, "name", e.target.value)}
                                placeholder="Project Name"
                            />
                        </div>
                        <div className="form-div mb-4">
                            <label>Description</label>
                            <textarea 
                                rows={2}
                                value={project.description}
                                onChange={(e) => onArrayChange("projects", index, "description", e.target.value)}
                                placeholder="Brief description of the project..."
                            />
                        </div>
                        <div className="form-div">
                            <label>Technologies Used</label>
                            <input 
                                type="text"
                                value={project.technologies}
                                onChange={(e) => onArrayChange("projects", index, "technologies", e.target.value)}
                                placeholder="React, Node.js, MongoDB"
                            />
                        </div>
                        {resumeData.projects.length > 1 && (
                            <button 
                                type="button"
                                onClick={() => onRemove("projects", index)}
                                className="mt-2 text-red-500 text-sm hover:underline"
                            >
                                Remove
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {/* Buttons */}
            <div className="flex flex-row gap-4">
                <button 
                    type="button"
                    onClick={onBack}
                    className="flex-1 py-4 border-2 border-gray-300 rounded-full font-semibold text-gray-600 hover:bg-gray-50"
                >
                    Back
                </button>
                <button 
                    type="submit"
                    className="flex-1 primary-button"
                >
                    Preview Resume
                </button>
            </div>
        </form>
    );
};

// Resume Preview
const ResumePreview = ({ template, resumeData, onBack }) => {
    const [isGenerating, setIsGenerating] = useState(false);

    const handleDownload = async () => {
        setIsGenerating(true);
        try {
            const html2pdfModule = await import('html2pdf.js');
            const html2pdf = html2pdfModule.default;
            
            const element = document.getElementById('resume-preview');
            const opt = {
                margin: 0,
                filename: `${resumeData.fullName || 'resume'}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };
            
            await html2pdf().set(opt).from(element).save();
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Failed to generate PDF. Please try again.');
        }
        setIsGenerating(false);
    };

    const getTextColor = () => template.style.primaryColor;

    return (
        <div className="w-full max-w-6xl">
            <div className="flex flex-row gap-4 mb-8 justify-center">
                <button 
                    onClick={onBack}
                    className="px-6 py-3 border-2 border-gray-300 rounded-full font-semibold text-gray-600 hover:bg-gray-50"
                >
                    ← Edit Details
                </button>
                <button 
                    onClick={handleDownload}
                    disabled={isGenerating}
                    className="px-6 py-3 primary-gradient text-white rounded-full font-semibold disabled:opacity-50"
                >
                    {isGenerating ? 'Generating PDF...' : 'Download PDF'}
                </button>
            </div>

            <div className="flex justify-center">
                <div 
                    id="resume-preview"
                    className="bg-white shadow-2xl"
                    style={{ 
                        width: '210mm', 
                        minHeight: '297mm',
                        padding: '20mm',
                        fontFamily: template.style.fontFamily,
                    }}
                >
                    <div className="border-b-2 pb-4 mb-6" style={{ borderColor: getTextColor() }}>
                        <h1 
                            className="text-3xl font-bold mb-2"
                            style={{ color: template.style.headerStyle === 'minimal' ? '#000' : getTextColor() }}
                        >
                            {resumeData.fullName || "Your Name"}
                        </h1>
                        
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                            {resumeData.email && <span>✉ {resumeData.email}</span>}
                            {resumeData.phone && <span>📞 {resumeData.phone}</span>}
                            {resumeData.location && <span>📍 {resumeData.location}</span>}
                            {resumeData.linkedin && <span>LinkedIn: {resumeData.linkedin}</span>}
                            {resumeData.github && <span>GitHub: {resumeData.github}</span>}
                        </div>
                    </div>

                    {resumeData.summary && (
                        <div className="mb-6">
                            <h2 
                                className="text-lg font-bold mb-2"
                                style={{ color: getTextColor() }}
                            >
                                Professional Summary
                            </h2>
                            <p className="text-gray-700 text-sm leading-relaxed">
                                {resumeData.summary}
                            </p>
                        </div>
                    )}

                    {resumeData.skills && (
                        <div className="mb-6">
                            <h2 
                                className="text-lg font-bold mb-2"
                                style={{ color: getTextColor() }}
                            >
                                Skills
                            </h2>
                            <p className="text-gray-700 text-sm">
                                {resumeData.skills}
                            </p>
                        </div>
                    )}

                    {resumeData.experience.some(exp => exp.company || exp.role) && (
                        <div className="mb-6">
                            <h2 
                                className="text-lg font-bold mb-3"
                                style={{ color: getTextColor() }}
                            >
                                Experience
                            </h2>
                            {resumeData.experience.map((exp, index) => (
                                (exp.company || exp.role) && (
                                    <div key={index} className="mb-4">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <h3 className="font-semibold text-gray-800">{exp.role || "Role"}</h3>
                                            <span className="text-sm text-gray-500">{exp.duration}</span>
                                        </div>
                                        <p className="font-medium text-gray-600 mb-1">{exp.company}</p>
                                        {exp.description && (
                                            <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                                                {exp.description}
                                            </p>
                                        )}
                                    </div>
                                )
                            ))}
                        </div>
                    )}

                    {resumeData.education.some(edu => edu.school || edu.degree) && (
                        <div className="mb-6">
                            <h2 
                                className="text-lg font-bold mb-3"
                                style={{ color: getTextColor() }}
                            >
                                Education
                            </h2>
                            {resumeData.education.map((edu, index) => (
                                (edu.school || edu.degree) && (
                                    <div key={index} className="mb-3">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <h3 className="font-semibold text-gray-800">{edu.school}</h3>
                                            <span className="text-sm text-gray-500">{edu.year}</span>
                                        </div>
                                        <p className="text-gray-600">
                                            {edu.degree}
                                            {edu.gpa && ` • GPA: ${edu.gpa}`}
                                        </p>
                                    </div>
                                )
                            ))}
                        </div>
                    )}

                    {resumeData.projects.some(proj => proj.name) && (
                        <div className="mb-6">
                            <h2 
                                className="text-lg font-bold mb-3"
                                style={{ color: getTextColor() }}
                            >
                                Projects
                            </h2>
                            {resumeData.projects.map((project, index) => (
                                project.name && (
                                    <div key={index} className="mb-3">
                                        <h3 className="font-semibold text-gray-800">{project.name}</h3>
                                        {project.description && (
                                            <p className="text-gray-700 text-sm mb-1">{project.description}</p>
                                        )}
                                        {project.technologies && (
                                            <p className="text-sm" style={{ color: getTextColor() }}>
                                                <strong>Technologies:</strong> {project.technologies}
                                            </p>
                                        )}
                                    </div>
                                )
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Builder;
