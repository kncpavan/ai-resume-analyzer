export interface PdfConversionResult {
    imageUrl: string;
    file: File | null;
    error?: string;
}

let pdfjsLib: any = null;
let isLoading = false;
let loadPromise: Promise<any> | null = null;

async function loadPdfJs(): Promise<any> {
    if (pdfjsLib) return pdfjsLib;
    if (loadPromise) return loadPromise;

    isLoading = true;
    loadPromise = import("pdfjs-dist").then((module) => {
        const lib = module.default || module;
        console.log("PDF.js library loaded successfully");
        
        // Set the worker source to use local file
        lib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
        
        console.log("Worker source set to:", lib.GlobalWorkerOptions.workerSrc);
        pdfjsLib = lib;
        isLoading = false;
        return lib;
    }).catch((err) => {
        console.error("Failed to load PDF.js library:", err);
        isLoading = false;
        loadPromise = null;
        throw err;
    });

    return loadPromise;
}

export async function convertPdfToImage(
    file: File
): Promise<PdfConversionResult> {
    try {
        console.log("Starting PDF conversion for:", file.name);
        
        const lib = await loadPdfJs();
        console.log("PDF.js library ready");

        const arrayBuffer = await file.arrayBuffer();
        console.log("File read as ArrayBuffer, size:", arrayBuffer.byteLength);
        
        const pdf = await lib.getDocument({ data: arrayBuffer }).promise;
        console.log("PDF document loaded, pages:", pdf.numPages);
        
        const page = await pdf.getPage(1);
        console.log("First page loaded");

        const viewport = page.getViewport({ scale: 4 });
        console.log("Viewport dimensions:", viewport.width, "x", viewport.height);
        
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        if (!context) {
            throw new Error("Failed to get 2D canvas context");
        }

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = "high";

        console.log("Rendering page to canvas...");
        await page.render({ canvasContext: context, viewport }).promise;
        console.log("Page rendered successfully");

        return new Promise((resolve) => {
            const timeout = setTimeout(() => {
                console.error("Canvas toBlob timed out after 10 seconds");
                resolve({
                    imageUrl: "",
                    file: null,
                    error: "Canvas conversion timed out",
                });
            }, 10000);

            canvas.toBlob(
                (blob) => {
                    clearTimeout(timeout);
                    if (blob) {
                        console.log("Blob created successfully, size:", blob.size);
                        const originalName = file.name.replace(/\.pdf$/i, "");
                        const imageFile = new File([blob], `${originalName}.png`, {
                            type: "image/png",
                        });

                        resolve({
                            imageUrl: URL.createObjectURL(blob),
                            file: imageFile,
                        });
                    } else {
                        console.error("Blob creation returned null");
                        resolve({
                            imageUrl: "",
                            file: null,
                            error: "Failed to create image blob",
                        });
                    }
                },
                "image/png",
                1.0
            );
        });
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.error("PDF conversion error:", err);
        return {
            imageUrl: "",
            file: null,
            error: `Failed to convert PDF: ${errorMessage}`,
        };
    }
}