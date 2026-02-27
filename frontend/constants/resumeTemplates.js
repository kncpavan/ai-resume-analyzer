// Resume Templates Data - FAANG Companies and Tech Industry Templates

export const resumeTemplates = [
    // FAANG Company Templates
    {
        id: "google-tech",
        name: "Google - Technical",
        company: "Google",
        category: "faang",
        description: "Modern, clean template optimized for Google and similar tech companies",
        style: {
            fontFamily: "Roboto, sans-serif",
            primaryColor: "#4285F4",
            layout: "modern-left",
            headerStyle: "compact"
        },
        sections: ["header", "summary", "experience", "education", "skills", "projects", "publications"],
        tips: "Focus on measurable achievements and technical skills. Use action verbs."
    },
    {
        id: "meta-tech",
        name: "Meta - Technical",
        company: "Meta",
        category: "faang",
        description: "Sleek template suitable for Meta, Facebook, and Instagram engineering roles",
        style: {
            fontFamily: "Helvetica, Arial, sans-serif",
            primaryColor: "#0668E1",
            layout: "modern-left",
            headerStyle: "standard"
        },
        sections: ["header", "summary", "skills", "experience", "education", "projects"],
        tips: "Highlight leadership and impact. Include scale of projects."
    },
    {
        id: "apple-tech",
        name: "Apple - Technical",
        company: "Apple",
        category: "faang",
        description: "Elegant template for Apple and design-focused companies",
        style: {
            fontFamily: "SF Pro, -apple-system, sans-serif",
            primaryColor: "#000000",
            layout: "minimal",
            headerStyle: "minimal"
        },
        sections: ["header", "summary", "experience", "skills", "education", "projects"],
        tips: "Keep it minimal and clean. Focus on design sensibility and attention to detail."
    },
    {
        id: "amazon-tech",
        name: "Amazon - Technical",
        company: "Amazon",
        category: "faang",
        description: "Result-driven template optimized for Amazon leadership principles",
        style: {
            fontFamily: "Amazon Ember, Arial, sans-serif",
            primaryColor: "#FF9900",
            layout: "traditional",
            headerStyle: "standard"
        },
        sections: ["header", "summary", "skills", "experience", "education", "projects", "certifications"],
        tips: "Use STAR method for achievements. Emphasize customer obsession and ownership."
    },
    {
        id: "netflix-tech",
        name: "Netflix - Technical",
        company: "Netflix",
        category: "faang",
        description: "Bold template for Netflix and entertainment tech roles",
        style: {
            fontFamily: "Netflix Sans, Arial, sans-serif",
            primaryColor: "#E50914",
            layout: "modern-left",
            headerStyle: "bold"
        },
        sections: ["header", "summary", "experience", "skills", "education", "projects"],
        tips: "Demonstrate innovation and passion for entertainment. Show technical depth."
    },
    {
        id: "microsoft-tech",
        name: "Microsoft - Technical",
        company: "Microsoft",
        category: "faang",
        description: "Professional template for Microsoft and enterprise software roles",
        style: {
            fontFamily: "Segoe UI, Arial, sans-serif",
            primaryColor: "#00A4EF",
            layout: "traditional",
            headerStyle: "standard"
        },
        sections: ["header", "summary", "skills", "experience", "education", "projects", "certifications"],
        tips: "Show breadth of technical knowledge. Include Microsoft certifications if relevant."
    },
    
    // Normal Tech Templates
    {
        id: "startup-modern",
        name: "Startup - Modern",
        company: "General Tech Startup",
        category: "tech",
        description: "Dynamic template for fast-growing startups",
        style: {
            fontFamily: "Inter, sans-serif",
            primaryColor: "#6366F1",
            layout: "modern-left",
            headerStyle: "bold"
        },
        sections: ["header", "summary", "skills", "experience", "projects", "education"],
        tips: "Show adaptability and wide skill set. Emphasize hands-on experience."
    },
    {
        id: "enterprise",
        name: "Enterprise - Professional",
        company: "General Enterprise",
        category: "tech",
        description: "Traditional template for large enterprise companies",
        style: {
            fontFamily: "Arial, sans-serif",
            primaryColor: "#1E40AF",
            layout: "traditional",
            headerStyle: "standard"
        },
        sections: ["header", "summary", "experience", "skills", "education", "certifications"],
        tips: "Emphasize stability and experience. Show deep technical expertise."
    },
    {
        id: "general-tech",
        name: "General Tech",
        company: "General Tech",
        category: "tech",
        description: "Versatile template suitable for any tech company",
        style: {
            fontFamily: "Roboto, sans-serif",
            primaryColor: "#059669",
            layout: "modern-left",
            headerStyle: "compact"
        },
        sections: ["header", "summary", "experience", "skills", "projects", "education"],
        tips: "Balance between technical skills and soft skills. Show continuous learning."
    },
    {
        id: "data-science",
        name: "Data Science",
        company: "Data/AI Roles",
        category: "tech",
        description: "Specialized template for data science and ML roles",
        style: {
            fontFamily: "Source Code Pro, monospace",
            primaryColor: "#7C3AED",
            layout: "modern-left",
            headerStyle: "technical"
        },
        sections: ["header", "summary", "skills", "projects", "experience", "education", "publications"],
        tips: "Highlight ML projects, publications, and technical certifications."
    },
    {
        id: "product-manager",
        name: "Product Manager",
        company: "Product Roles",
        category: "tech",
        description: "Template for technical product manager roles",
        style: {
            fontFamily: "Inter, sans-serif",
            primaryColor: "#DB2777",
            layout: "modern-left",
            headerStyle: "standard"
        },
        sections: ["header", "summary", "experience", "skills", "education", "achievements"],
        tips: "Show product sense, technical understanding, and leadership impact."
    },
    {
        id: "devops-engineer",
        name: "DevOps Engineer",
        company: "DevOps/SRE",
        category: "tech",
        description: "Template for DevOps and infrastructure roles",
        style: {
            fontFamily: "Fira Code, monospace",
            primaryColor: "#0D9488",
            layout: "technical",
            headerStyle: "technical"
        },
        sections: ["header", "summary", "skills", "experience", "certifications", "projects", "education"],
        tips: "Highlight CI/CD pipelines, cloud certifications, and infrastructure automation."
    }
];

export const getTemplatesByCategory = (category) => {
    return resumeTemplates.filter(template => template.category === category);
};

export const getTemplateById = (id) => {
    return resumeTemplates.find(template => template.id === id);
};

export const faangTemplates = getTemplatesByCategory("faang");
export const techTemplates = getTemplatesByCategory("tech");
