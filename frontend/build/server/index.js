import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { PassThrough } from "node:stream";
import { createReadableStreamFromReadable } from "@react-router/node";
import { ServerRouter, UNSAFE_withComponentProps, Outlet, UNSAFE_withErrorBoundaryProps, isRouteErrorResponse, Meta, Links, ScrollRestoration, Scripts, Link, useNavigate, useSearchParams, useParams } from "react-router";
import { isbot } from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import { create } from "zustand";
import { useEffect, useState, useCallback, createContext, useContext } from "react";
import { useDropzone } from "react-dropzone";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
const streamTimeout = 5e3;
function handleRequest(request, responseStatusCode, responseHeaders, routerContext, loadContext) {
  if (request.method.toUpperCase() === "HEAD") {
    return new Response(null, {
      status: responseStatusCode,
      headers: responseHeaders
    });
  }
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    let userAgent = request.headers.get("user-agent");
    let readyOption = userAgent && isbot(userAgent) || routerContext.isSpaMode ? "onAllReady" : "onShellReady";
    let timeoutId = setTimeout(
      () => abort(),
      streamTimeout + 1e3
    );
    const { pipe, abort } = renderToPipeableStream(
      /* @__PURE__ */ jsx(ServerRouter, { context: routerContext, url: request.url }),
      {
        [readyOption]() {
          shellRendered = true;
          const body = new PassThrough({
            final(callback) {
              clearTimeout(timeoutId);
              timeoutId = void 0;
              callback();
            }
          });
          const stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html");
          pipe(body);
          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode
            })
          );
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500;
          if (shellRendered) {
            console.error(error);
          }
        }
      }
    );
  });
}
const entryServer = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: handleRequest,
  streamTimeout
}, Symbol.toStringTag, { value: "Module" }));
const getPuter = () => {
  return typeof window !== "undefined" && window.puter ? window.puter : null;
};
const usePuterStore = create((set, get) => {
  const setError = (msg) => {
    set({
      error: msg,
      isLoading: false,
      auth: {
        user: null,
        isAuthenticated: false,
        signIn: get().auth.signIn,
        signOut: get().auth.signOut,
        refreshUser: get().auth.refreshUser,
        checkAuthStatus: get().auth.checkAuthStatus,
        getUser: get().auth.getUser
      }
    });
  };
  const checkAuthStatus = async () => {
    const puter = getPuter();
    if (!puter) {
      setError("Puter.js not available");
      return false;
    }
    set({ isLoading: true, error: null });
    try {
      const isSignedIn = await puter.auth.isSignedIn();
      if (isSignedIn) {
        const user = await puter.auth.getUser();
        set({
          auth: {
            user,
            isAuthenticated: true,
            signIn: get().auth.signIn,
            signOut: get().auth.signOut,
            refreshUser: get().auth.refreshUser,
            checkAuthStatus: get().auth.checkAuthStatus,
            getUser: () => user
          },
          isLoading: false
        });
        return true;
      } else {
        set({
          auth: {
            user: null,
            isAuthenticated: false,
            signIn: get().auth.signIn,
            signOut: get().auth.signOut,
            refreshUser: get().auth.refreshUser,
            checkAuthStatus: get().auth.checkAuthStatus,
            getUser: () => null
          },
          isLoading: false
        });
        return false;
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to check auth status";
      setError(msg);
      return false;
    }
  };
  const signIn = async () => {
    const puter = getPuter();
    if (!puter) {
      setError("Puter.js not available");
      return;
    }
    set({ isLoading: true, error: null });
    try {
      await puter.auth.signIn();
      await checkAuthStatus();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Sign in failed";
      setError(msg);
    }
  };
  const signOut = async () => {
    const puter = getPuter();
    if (!puter) {
      setError("Puter.js not available");
      return;
    }
    set({ isLoading: true, error: null });
    try {
      await puter.auth.signOut();
      set({
        auth: {
          user: null,
          isAuthenticated: false,
          signIn: get().auth.signIn,
          signOut: get().auth.signOut,
          refreshUser: get().auth.refreshUser,
          checkAuthStatus: get().auth.checkAuthStatus,
          getUser: () => null
        },
        isLoading: false
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Sign out failed";
      setError(msg);
    }
  };
  const refreshUser = async () => {
    const puter = getPuter();
    if (!puter) {
      setError("Puter.js not available");
      return;
    }
    set({ isLoading: true, error: null });
    try {
      const user = await puter.auth.getUser();
      set({
        auth: {
          user,
          isAuthenticated: true,
          signIn: get().auth.signIn,
          signOut: get().auth.signOut,
          refreshUser: get().auth.refreshUser,
          checkAuthStatus: get().auth.checkAuthStatus,
          getUser: () => user
        },
        isLoading: false
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to refresh user";
      setError(msg);
    }
  };
  const init = () => {
    const puter = getPuter();
    if (puter) {
      set({ puterReady: true });
      checkAuthStatus();
      return;
    }
    const interval = setInterval(() => {
      if (getPuter()) {
        clearInterval(interval);
        set({ puterReady: true });
        checkAuthStatus();
      }
    }, 100);
    setTimeout(() => {
      clearInterval(interval);
      if (!getPuter()) {
        setError("Puter.js failed to load within 10 seconds");
      }
    }, 1e4);
  };
  const write = async (path, data) => {
    const puter = getPuter();
    if (!puter) {
      setError("Puter.js not available");
      return;
    }
    return puter.fs.write(path, data);
  };
  const readDir = async (path) => {
    const puter = getPuter();
    if (!puter) {
      setError("Puter.js not available");
      return;
    }
    return puter.fs.readdir(path);
  };
  const readFile = async (path) => {
    const puter = getPuter();
    if (!puter) {
      setError("Puter.js not available");
      return;
    }
    return puter.fs.read(path);
  };
  const upload2 = async (files) => {
    const puter = getPuter();
    if (!puter) {
      setError("Puter.js not available");
      return;
    }
    return puter.fs.upload(files);
  };
  const deleteFile = async (path) => {
    const puter = getPuter();
    if (!puter) {
      setError("Puter.js not available");
      return;
    }
    return puter.fs.delete(path);
  };
  const chat = async (prompt, imageURL, testMode, options) => {
    const puter = getPuter();
    if (!puter) {
      setError("Puter.js not available");
      return;
    }
    return puter.ai.chat(prompt, imageURL, testMode, options);
  };
  const feedback = async (path, message) => {
    const puter = getPuter();
    if (!puter) {
      setError("Puter.js not available");
      return;
    }
    return puter.ai.chat(
      [
        {
          role: "user",
          content: [
            {
              type: "file",
              puter_path: path
            },
            {
              type: "text",
              text: message
            }
          ]
        }
      ],
      { model: "claude-sonnet-4" }
    );
  };
  const img2txt = async (image, testMode) => {
    const puter = getPuter();
    if (!puter) {
      setError("Puter.js not available");
      return;
    }
    return puter.ai.img2txt(image, testMode);
  };
  const getKV = async (key) => {
    const puter = getPuter();
    if (!puter) {
      setError("Puter.js not available");
      return;
    }
    return puter.kv.get(key);
  };
  const setKV = async (key, value) => {
    const puter = getPuter();
    if (!puter) {
      setError("Puter.js not available");
      return;
    }
    return puter.kv.set(key, value);
  };
  const deleteKV = async (key) => {
    const puter = getPuter();
    if (!puter) {
      setError("Puter.js not available");
      return;
    }
    return puter.kv.delete(key);
  };
  const listKV = async (pattern, returnValues) => {
    const puter = getPuter();
    if (!puter) {
      setError("Puter.js not available");
      return;
    }
    if (returnValues === void 0) {
      returnValues = false;
    }
    return puter.kv.list(pattern, returnValues);
  };
  const flushKV = async () => {
    const puter = getPuter();
    if (!puter) {
      setError("Puter.js not available");
      return;
    }
    return puter.kv.flush();
  };
  return {
    isLoading: true,
    error: null,
    puterReady: false,
    auth: {
      user: null,
      isAuthenticated: false,
      signIn,
      signOut,
      refreshUser,
      checkAuthStatus,
      getUser: () => get().auth.user
    },
    fs: {
      write: (path, data) => write(path, data),
      read: (path) => readFile(path),
      readDir: (path) => readDir(path),
      upload: (files) => upload2(files),
      delete: (path) => deleteFile(path)
    },
    ai: {
      chat: (prompt, imageURL, testMode, options) => chat(prompt, imageURL, testMode, options),
      feedback: (path, message) => feedback(path, message),
      img2txt: (image, testMode) => img2txt(image, testMode)
    },
    kv: {
      get: (key) => getKV(key),
      set: (key, value) => setKV(key, value),
      delete: (key) => deleteKV(key),
      list: (pattern, returnValues) => listKV(pattern, returnValues),
      flush: () => flushKV()
    },
    init,
    clearError: () => set({ error: null })
  };
});
const links = () => [{
  rel: "preconnect",
  href: "https://fonts.googleapis.com"
}, {
  rel: "preconnect",
  href: "https://fonts.gstatic.com",
  crossOrigin: "anonymous"
}, {
  rel: "stylesheet",
  href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap"
}];
function Layout({
  children
}) {
  const {
    init
  } = usePuterStore();
  useEffect(() => {
    init();
  }, [init]);
  return /* @__PURE__ */ jsxs("html", {
    lang: "en",
    children: [/* @__PURE__ */ jsxs("head", {
      children: [/* @__PURE__ */ jsx("meta", {
        charSet: "utf-8"
      }), /* @__PURE__ */ jsx("meta", {
        name: "viewport",
        content: "width=device-width, initial-scale=1"
      }), /* @__PURE__ */ jsx(Meta, {}), /* @__PURE__ */ jsx(Links, {})]
    }), /* @__PURE__ */ jsxs("body", {
      children: [/* @__PURE__ */ jsx("script", {
        src: "https://js.puter.com/v2/"
      }), children, /* @__PURE__ */ jsx(ScrollRestoration, {}), /* @__PURE__ */ jsx(Scripts, {})]
    })]
  });
}
const root = UNSAFE_withComponentProps(function App() {
  return /* @__PURE__ */ jsx(Outlet, {});
});
const ErrorBoundary = UNSAFE_withErrorBoundaryProps(function ErrorBoundary2({
  error
}) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack;
  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details = error.status === 404 ? "The requested page could not be found." : error.statusText || details;
  }
  return /* @__PURE__ */ jsxs("main", {
    className: "pt-16 p-4 container mx-auto",
    children: [/* @__PURE__ */ jsx("h1", {
      children: message
    }), /* @__PURE__ */ jsx("p", {
      children: details
    }), stack]
  });
});
const route0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ErrorBoundary,
  Layout,
  default: root,
  links
}, Symbol.toStringTag, { value: "Module" }));
const Navbar = () => {
  return /* @__PURE__ */ jsxs("nav", { className: "navbar", children: [
    /* @__PURE__ */ jsx(Link, { to: "/", children: /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-gradient", children: "JobFit AI" }) }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-row gap-4", children: [
      /* @__PURE__ */ jsx(Link, { to: "/builder", className: "primary-button w-fit", children: "Create Resume" }),
      /* @__PURE__ */ jsx(Link, { to: "/upload", className: "primary-button w-fit", children: "Upload Resume" })
    ] })
  ] });
};
const ScoreCircle = ({ score = 75 }) => {
  const radius = 40;
  const stroke = 8;
  const normalizedRadius = radius - stroke / 2;
  const circumference = 2 * Math.PI * normalizedRadius;
  const progress = score / 100;
  const strokeDashoffset = circumference * (1 - progress);
  return /* @__PURE__ */ jsxs("div", { className: "relative w-[100px] h-[100px]", children: [
    /* @__PURE__ */ jsxs(
      "svg",
      {
        height: "100%",
        width: "100%",
        viewBox: "0 0 100 100",
        className: "transform -rotate-90",
        children: [
          /* @__PURE__ */ jsx(
            "circle",
            {
              cx: "50",
              cy: "50",
              r: normalizedRadius,
              stroke: "#e5e7eb",
              strokeWidth: stroke,
              fill: "transparent"
            }
          ),
          /* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsxs("linearGradient", { id: "grad", x1: "1", y1: "0", x2: "0", y2: "1", children: [
            /* @__PURE__ */ jsx("stop", { offset: "0%", stopColor: "#FF97AD" }),
            /* @__PURE__ */ jsx("stop", { offset: "100%", stopColor: "#5171FF" })
          ] }) }),
          /* @__PURE__ */ jsx(
            "circle",
            {
              cx: "50",
              cy: "50",
              r: normalizedRadius,
              stroke: "url(#grad)",
              strokeWidth: stroke,
              fill: "transparent",
              strokeDasharray: circumference,
              strokeDashoffset,
              strokeLinecap: "round"
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "absolute inset-0 flex flex-col items-center justify-center", children: /* @__PURE__ */ jsx("span", { className: "font-semibold text-sm", children: `${score}/100` }) })
  ] });
};
const ResumeCard = ({ resume: resume2 }) => {
  const { id, companyName, jobTitle, feedback, imagePath } = resume2;
  const { fs } = usePuterStore();
  const [resumeUrl, setResumeUrl] = useState("");
  useEffect(() => {
    const loadResume = async () => {
      const blob = await fs.read(imagePath);
      if (!blob) return;
      let url = URL.createObjectURL(blob);
      setResumeUrl(url);
    };
    loadResume();
  }, [imagePath]);
  return /* @__PURE__ */ jsxs(Link, { to: `/resume/${id}`, className: "resume-card animate-in fade-in duration-1000", children: [
    /* @__PURE__ */ jsxs("div", { className: "resume-card-header", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2", children: [
        companyName && /* @__PURE__ */ jsx("h2", { className: "!text-black font-bold break-words", children: companyName }),
        jobTitle && /* @__PURE__ */ jsx("h3", { className: "text-lg break-words text-gray-500", children: jobTitle }),
        !companyName && !jobTitle && /* @__PURE__ */ jsx("h2", { className: "!text-black font-bold", children: "Resume" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex-shrink-0", children: /* @__PURE__ */ jsx(ScoreCircle, { score: feedback.overallScore }) })
    ] }),
    resumeUrl && /* @__PURE__ */ jsx("div", { className: "gradient-border animate-in fade-in duration-1000", children: /* @__PURE__ */ jsx("div", { className: "w-full h-full", children: /* @__PURE__ */ jsx(
      "img",
      {
        src: resumeUrl,
        alt: "resume",
        className: "w-full h-[350px] max-sm:h-[200px] object-cover object-top"
      }
    ) }) })
  ] });
};
function meta$4() {
  return [{
    title: "Resumind"
  }, {
    name: "description",
    content: "Smart feedback for your dream job!"
  }];
}
const home = UNSAFE_withComponentProps(function Home() {
  const {
    auth: auth2,
    kv
  } = usePuterStore();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState([]);
  const [loadingResumes, setLoadingResumes] = useState(false);
  useEffect(() => {
    if (!auth2.isAuthenticated) navigate("/auth?next=/");
  }, [auth2.isAuthenticated, navigate]);
  useEffect(() => {
    const loadResumes = async () => {
      setLoadingResumes(true);
      const resumes2 = await kv.list("resume:*", true);
      const parsedResumes = resumes2?.map((resume2) => JSON.parse(resume2.value));
      setResumes(parsedResumes || []);
      setLoadingResumes(false);
    };
    loadResumes();
  }, [kv]);
  return /* @__PURE__ */ jsxs("main", {
    className: "bg-[url('/images/bg-main.svg')] bg-cover",
    children: [/* @__PURE__ */ jsx(Navbar, {}), /* @__PURE__ */ jsxs("section", {
      className: "main-section",
      children: [/* @__PURE__ */ jsxs("div", {
        className: "page-heading py-16",
        children: [/* @__PURE__ */ jsx("h1", {
          children: "Track Your Applications & Resume Ratings"
        }), !loadingResumes && resumes?.length === 0 ? /* @__PURE__ */ jsx("h2", {
          children: "No resumes found. Upload your first resume to get feedback."
        }) : /* @__PURE__ */ jsx("h2", {
          children: "Review your submissions and check AI-powered feedback."
        })]
      }), loadingResumes && /* @__PURE__ */ jsx("div", {
        className: "flex flex-col items-center justify-center",
        children: /* @__PURE__ */ jsx("img", {
          src: "/images/resume-scan-2.gif",
          className: "w-[200px]"
        })
      }), !loadingResumes && resumes.length > 0 && /* @__PURE__ */ jsx("div", {
        className: "resumes-section",
        children: resumes.map((resume2) => /* @__PURE__ */ jsx(ResumeCard, {
          resume: resume2
        }, resume2.id))
      }), !loadingResumes && resumes?.length === 0 && /* @__PURE__ */ jsx("div", {
        className: "flex flex-col items-center justify-center mt-10 gap-4",
        children: /* @__PURE__ */ jsx(Link, {
          to: "/upload",
          className: "primary-button w-fit text-xl font-semibold",
          children: "Upload Resume"
        })
      })]
    })]
  });
});
const route1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: home,
  meta: meta$4
}, Symbol.toStringTag, { value: "Module" }));
function meta$3() {
  return [{
    title: "Authenticate | Resumind"
  }, {
    name: "description",
    content: "Sign in to continue"
  }];
}
const Auth = () => {
  const {
    auth: auth2,
    isLoading
  } = usePuterStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const next = searchParams.get("next") || "/";
  useEffect(() => {
    if (!isLoading && auth2.isAuthenticated) {
      navigate(next);
    }
  }, [isLoading, auth2.isAuthenticated, navigate, next]);
  const handleSignIn = async () => {
    await auth2.signIn();
    navigate(next);
  };
  if (isLoading) {
    return /* @__PURE__ */ jsx("main", {
      className: "bg-[url('/images/bg-auth.svg')] bg-cover min-h-screen flex items-center justify-center",
      children: /* @__PURE__ */ jsx("div", {
        className: "flex flex-col items-center justify-center",
        children: /* @__PURE__ */ jsx("img", {
          src: "/images/resume-scan-2.gif",
          className: "w-[200px]"
        })
      })
    });
  }
  return /* @__PURE__ */ jsx("main", {
    className: "bg-[url('/images/bg-auth.svg')] bg-cover min-h-screen flex items-center justify-center",
    children: /* @__PURE__ */ jsxs("div", {
      className: "bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 max-w-md w-full mx-4",
      children: [/* @__PURE__ */ jsxs("div", {
        className: "text-center mb-8",
        children: [/* @__PURE__ */ jsx("h1", {
          className: "text-4xl font-bold text-gradient mb-2",
          children: "RESUMIND"
        }), /* @__PURE__ */ jsx("p", {
          className: "text-gray-600",
          children: "Smart feedback for your dream job!"
        })]
      }), /* @__PURE__ */ jsxs("div", {
        className: "space-y-4",
        children: [/* @__PURE__ */ jsx("button", {
          onClick: handleSignIn,
          className: "w-full primary-button py-3 px-4 text-lg font-semibold",
          children: "Sign in with Puter.ai"
        }), /* @__PURE__ */ jsx("div", {
          className: "text-center text-sm text-gray-500",
          children: /* @__PURE__ */ jsx("p", {
            children: "Sign in to save your resume analysis"
          })
        })]
      }), /* @__PURE__ */ jsx("div", {
        className: "mt-8 text-center",
        children: /* @__PURE__ */ jsx(Link, {
          to: "/",
          className: "text-gray-500 hover:text-gray-700",
          children: "Back to Home"
        })
      })]
    })
  });
};
const auth = UNSAFE_withComponentProps(Auth);
const route2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: auth,
  meta: meta$3
}, Symbol.toStringTag, { value: "Module" }));
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
function formatSize(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}
const generateUUID = () => crypto.randomUUID();
let pdfjsLib = null;
let loadPromise = null;
async function loadPdfJs() {
  if (pdfjsLib) return pdfjsLib;
  if (loadPromise) return loadPromise;
  loadPromise = import("pdfjs-dist").then((module) => {
    const lib = module.default || module;
    console.log("PDF.js library loaded successfully");
    lib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
    console.log("Worker source set to:", lib.GlobalWorkerOptions.workerSrc);
    pdfjsLib = lib;
    return lib;
  }).catch((err) => {
    console.error("Failed to load PDF.js library:", err);
    loadPromise = null;
    throw err;
  });
  return loadPromise;
}
async function convertPdfToImage(file) {
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
          error: "Canvas conversion timed out"
        });
      }, 1e4);
      canvas.toBlob(
        (blob) => {
          clearTimeout(timeout);
          if (blob) {
            console.log("Blob created successfully, size:", blob.size);
            const originalName = file.name.replace(/\.pdf$/i, "");
            const imageFile = new File([blob], `${originalName}.png`, {
              type: "image/png"
            });
            resolve({
              imageUrl: URL.createObjectURL(blob),
              file: imageFile
            });
          } else {
            console.error("Blob creation returned null");
            resolve({
              imageUrl: "",
              file: null,
              error: "Failed to create image blob"
            });
          }
        },
        "image/png",
        1
      );
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error("PDF conversion error:", err);
    return {
      imageUrl: "",
      file: null,
      error: `Failed to convert PDF: ${errorMessage}`
    };
  }
}
const FileUploader = ({ onFileSelect }) => {
  const onDrop = useCallback(async (acceptedFiles2) => {
    const file2 = acceptedFiles2[0] || null;
    if (file2) {
      try {
        const image = await convertPdfToImage(file2);
        console.log("Converted Image:", image);
      } catch (err) {
        console.error("PDF conversion failed", err);
      }
    }
    if (onFileSelect) {
      onFileSelect(file2);
    }
  }, [onFileSelect]);
  const maxFileSize = 20 * 1024 * 1024;
  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
    onDrop,
    multiple: false,
    accept: { "application/pdf": [".pdf"] },
    maxSize: maxFileSize
  });
  const file = acceptedFiles[0] || null;
  return /* @__PURE__ */ jsx("div", { className: "w-full gradient-border", children: /* @__PURE__ */ jsxs("div", { ...getRootProps(), children: [
    /* @__PURE__ */ jsx("input", { ...getInputProps() }),
    /* @__PURE__ */ jsx("div", { className: "space-y-4 cursor-pointer", children: file ? /* @__PURE__ */ jsxs("div", { className: "uploader-selected-file", onClick: (e) => e.stopPropagation(), children: [
      /* @__PURE__ */ jsx("img", { src: "/images/pdf.png", alt: "pdf", className: "size-10" }),
      /* @__PURE__ */ jsx("div", { className: "flex items-center space-x-3", children: /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-gray-700 truncate max-w-xs", children: file.name }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500", children: formatSize(file.size) })
      ] }) }),
      /* @__PURE__ */ jsx("button", { className: "p-2 cursor-pointer", onClick: (e) => {
        if (onFileSelect) onFileSelect(null);
      }, children: /* @__PURE__ */ jsx("img", { src: "/icons/cross.svg", alt: "remove", className: "w-4 h-4" }) })
    ] }) : /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("div", { className: "mx-auto w-16 h-16 flex items-center justify-center mb-2", children: /* @__PURE__ */ jsx("img", { src: "/icons/info.svg", alt: "upload", className: "size-20" }) }),
      /* @__PURE__ */ jsxs("p", { className: "text-lg text-gray-500", children: [
        /* @__PURE__ */ jsx("span", { className: "font-semibold", children: "Click to upload" }),
        " or drag and drop"
      ] }),
      /* @__PURE__ */ jsxs("p", { className: "text-lg text-gray-500", children: [
        "PDF (max ",
        formatSize(maxFileSize),
        ")"
      ] })
    ] }) })
  ] }) });
};
const AIResponseFormat = `
      interface Feedback {
      overallScore: number; //max 100
      ATS: {
        score: number; //rate based on ATS suitability
        tips: {
          type: "good" | "improve";
          tip: string; //give 3-4 tips
        }[];
      };
      toneAndStyle: {
        score: number; //max 100
        tips: {
          type: "good" | "improve";
          tip: string; //make it a short "title" for the actual explanation
          explanation: string; //explain in detail here
        }[]; //give 3-4 tips
      };
      content: {
        score: number; //max 100
        tips: {
          type: "good" | "improve";
          tip: string; //make it a short "title" for the actual explanation
          explanation: string; //explain in detail here
        }[]; //give 3-4 tips
      };
      structure: {
        score: number; //max 100
        tips: {
          type: "good" | "improve";
          tip: string; //make it a short "title" for the actual explanation
          explanation: string; //explain in detail here
        }[]; //give 3-4 tips
      };
      skills: {
        score: number; //max 100
        tips: {
          type: "good" | "improve";
          tip: string; //make it a short "title" for the actual explanation
          explanation: string; //explain in detail here
        }[]; //give 3-4 tips
      };
    }`;
const prepareInstructions = ({ jobTitle, jobDescription }) => `You are an expert in ATS (Applicant Tracking System) and resume analysis.
      Please analyze and rate this resume and suggest how to improve it.
      The rating can be low if the resume is bad.
      Be thorough and detailed. Don't be afraid to point out any mistakes or areas for improvement.
      If there is a lot to improve, don't hesitate to give low scores. This is to help the user to improve their resume.
      If available, use the job description for the job user is applying to to give more detailed feedback.
      If provided, take the job description into consideration.
      The job title is: ${jobTitle}
      The job description is: ${jobDescription}
      Provide the feedback using the following format:
      ${AIResponseFormat}
      Return the analysis as an JSON object, without any other text and without the backticks.
      Do not include any other text or comments.`;
const Upload = () => {
  const {
    fs,
    ai,
    kv
  } = usePuterStore();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [file, setFile] = useState(null);
  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
  };
  const handleAnalyze = async ({
    companyName,
    jobTitle,
    jobDescription,
    file: file2
  }) => {
    try {
      setIsProcessing(true);
      setStatusText("Uploading the file...");
      const uploadedFile = await fs.upload([file2]);
      if (!uploadedFile) return setStatusText("Error: Failed to upload file");
      setStatusText("Converting to image...");
      const imageFile = await convertPdfToImage(file2);
      if (!imageFile.file) return setStatusText("Error: Failed to convert PDF to image");
      setStatusText("Uploading the image...");
      const uploadedImage = await fs.upload([imageFile.file]);
      if (!uploadedImage) return setStatusText("Error: Failed to upload image");
      setStatusText("Preparing data...");
      const uuid = generateUUID();
      const data = {
        id: uuid,
        resumePath: uploadedFile.path,
        imagePath: uploadedImage.path,
        companyName,
        jobTitle,
        jobDescription,
        feedback: ""
      };
      await kv.set(`resume:${uuid}`, JSON.stringify(data));
      setStatusText("Analyzing...");
      const feedback = await ai.feedback(uploadedFile.path, prepareInstructions({
        jobTitle,
        jobDescription
      }));
      if (!feedback) return setStatusText("Error: Failed to analyze resume");
      const feedbackText = typeof feedback.message.content === "string" ? feedback.message.content : feedback.message.content[0].text;
      data.feedback = JSON.parse(feedbackText);
      await kv.set(`resume:${uuid}`, JSON.stringify(data));
      setStatusText("Analysis complete, redirecting...");
      console.log(data);
      navigate(`/resume/${uuid}`);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error("Analysis error:", err);
      setStatusText(`Error: ${errorMsg}`);
      setIsProcessing(false);
    }
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.currentTarget.closest("form");
    if (!form) return;
    const formData = new FormData(form);
    const companyName = formData.get("company-name");
    const jobTitle = formData.get("job-title");
    const jobDescription = formData.get("job-description");
    if (!file) return;
    handleAnalyze({
      companyName,
      jobTitle,
      jobDescription,
      file
    });
  };
  return /* @__PURE__ */ jsxs("main", {
    className: "bg-[url('/images/bg-main.svg')] bg-cover",
    children: [/* @__PURE__ */ jsx(Navbar, {}), /* @__PURE__ */ jsx("section", {
      className: "main-section",
      children: /* @__PURE__ */ jsxs("div", {
        className: "page-heading py-16",
        children: [/* @__PURE__ */ jsx("h1", {
          children: "Smart feedback for your dream job"
        }), isProcessing ? /* @__PURE__ */ jsxs(Fragment, {
          children: [/* @__PURE__ */ jsx("h2", {
            children: statusText
          }), /* @__PURE__ */ jsx("img", {
            src: "/images/resume-scan.gif",
            className: "w-full"
          })]
        }) : /* @__PURE__ */ jsx("h2", {
          children: "Drop your resume for an ATS score and improvement tips"
        }), !isProcessing && /* @__PURE__ */ jsxs("form", {
          id: "upload-form",
          onSubmit: handleSubmit,
          className: "flex flex-col gap-4 mt-8",
          children: [/* @__PURE__ */ jsxs("div", {
            className: "form-div",
            children: [/* @__PURE__ */ jsx("label", {
              htmlFor: "company-name",
              children: "Company Name"
            }), /* @__PURE__ */ jsx("input", {
              type: "text",
              name: "company-name",
              placeholder: "Company Name",
              id: "company-name"
            })]
          }), /* @__PURE__ */ jsxs("div", {
            className: "form-div",
            children: [/* @__PURE__ */ jsx("label", {
              htmlFor: "job-title",
              children: "Job Title"
            }), /* @__PURE__ */ jsx("input", {
              type: "text",
              name: "job-title",
              placeholder: "Job Title",
              id: "job-title"
            })]
          }), /* @__PURE__ */ jsxs("div", {
            className: "form-div",
            children: [/* @__PURE__ */ jsx("label", {
              htmlFor: "job-description",
              children: "Job Description"
            }), /* @__PURE__ */ jsx("textarea", {
              rows: 5,
              name: "job-description",
              placeholder: "Job Description",
              id: "job-description"
            })]
          }), /* @__PURE__ */ jsxs("div", {
            className: "form-div",
            children: [/* @__PURE__ */ jsx("label", {
              htmlFor: "uploader",
              children: "Upload Resume"
            }), /* @__PURE__ */ jsx(FileUploader, {
              onFileSelect: handleFileSelect
            })]
          }), /* @__PURE__ */ jsx("button", {
            className: "primary-button",
            type: "submit",
            children: "Analyze Resume"
          })]
        })]
      })
    })]
  });
};
const upload = UNSAFE_withComponentProps(Upload);
const route3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: upload
}, Symbol.toStringTag, { value: "Module" }));
const ScoreGauge = ({ score = 75 }) => {
  const getScoreColor = (score2) => {
    if (score2 > 70) return "#22c55e";
    if (score2 > 49) return "#eab308";
    return "#ef4444";
  };
  const getGradientId = (score2) => {
    if (score2 > 70) return "gauge-grad-good";
    if (score2 > 49) return "gauge-grad-warning";
    return "gauge-grad-bad";
  };
  const scoreColor = getScoreColor(score);
  const gradientId = getGradientId(score);
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const progress = score / 100;
  const strokeDashoffset = circumference * (1 - progress);
  return /* @__PURE__ */ jsxs("div", { className: "relative w-[180px] h-[180px]", children: [
    /* @__PURE__ */ jsxs(
      "svg",
      {
        width: "180",
        height: "180",
        viewBox: "0 0 180 180",
        className: "transform -rotate-90",
        children: [
          /* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsxs("linearGradient", { id: gradientId, x1: "0%", y1: "0%", x2: "100%", y2: "0%", children: [
            /* @__PURE__ */ jsx("stop", { offset: "0%", stopColor: scoreColor, stopOpacity: "0.5" }),
            /* @__PURE__ */ jsx("stop", { offset: "100%", stopColor: scoreColor })
          ] }) }),
          /* @__PURE__ */ jsx(
            "circle",
            {
              cx: "90",
              cy: "90",
              r: radius,
              stroke: "#e5e7eb",
              strokeWidth: "12",
              fill: "none"
            }
          ),
          /* @__PURE__ */ jsx(
            "circle",
            {
              cx: "90",
              cy: "90",
              r: radius,
              stroke: `url(#${gradientId})`,
              strokeWidth: "12",
              fill: "none",
              strokeLinecap: "round",
              strokeDasharray: circumference,
              strokeDashoffset,
              className: "transition-all duration-1000 ease-out"
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "absolute inset-0 flex flex-col items-center justify-center", children: [
      /* @__PURE__ */ jsx("span", { className: "text-5xl font-bold", style: { color: scoreColor }, children: score }),
      /* @__PURE__ */ jsx("span", { className: "text-gray-500 text-sm", children: "/100" })
    ] })
  ] });
};
const ScoreBadge$1 = ({ score }) => {
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: cn(
        "flex flex-row gap-1 items-center px-2 py-0.5 rounded-[96px]",
        score > 69 ? "bg-badge-green" : score > 39 ? "bg-badge-yellow" : "bg-badge-red"
      ),
      children: [
        /* @__PURE__ */ jsx(
          "img",
          {
            src: score > 69 ? "/icons/check.svg" : "/icons/warning.svg",
            alt: "score",
            className: "size-4"
          }
        ),
        /* @__PURE__ */ jsxs(
          "p",
          {
            className: cn(
              "text-sm font-medium",
              score > 69 ? "text-badge-green-text" : score > 39 ? "text-badge-yellow-text" : "text-badge-red-text"
            ),
            children: [
              score,
              "/100"
            ]
          }
        )
      ]
    }
  );
};
const Category = ({ title, score }) => {
  const textColor = score > 70 ? "text-green-600" : score > 49 ? "text-yellow-600" : "text-red-600";
  return /* @__PURE__ */ jsx("div", { className: "resume-summary", children: /* @__PURE__ */ jsxs("div", { className: "category", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-row gap-2 items-center justify-center", children: [
      /* @__PURE__ */ jsx("p", { className: "text-2xl", children: title }),
      /* @__PURE__ */ jsx(ScoreBadge$1, { score })
    ] }),
    /* @__PURE__ */ jsxs("p", { className: "text-2xl", children: [
      /* @__PURE__ */ jsx("span", { className: textColor, children: score }),
      "/100"
    ] })
  ] }) });
};
const Summary = ({ feedback }) => {
  return /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-md w-full", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-row items-center p-4 gap-8", children: [
      /* @__PURE__ */ jsx(ScoreGauge, { score: feedback.overallScore }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold", children: "Your Resume Score" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500", children: "This score is calculated based on the variables listed below." })
      ] })
    ] }),
    /* @__PURE__ */ jsx(Category, { title: "Tone & Style", score: feedback.toneAndStyle.score }),
    /* @__PURE__ */ jsx(Category, { title: "Content", score: feedback.content.score }),
    /* @__PURE__ */ jsx(Category, { title: "Structure", score: feedback.structure.score }),
    /* @__PURE__ */ jsx(Category, { title: "Skills", score: feedback.skills.score })
  ] });
};
const ATS = ({ score, suggestions }) => {
  return /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-md w-full p-4", children: [
    /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold mb-4", children: "ATS Compatibility" }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 mb-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "text-4xl font-bold", children: [
        score,
        "%"
      ] }),
      /* @__PURE__ */ jsx("div", { className: cn(
        "px-3 py-1 rounded-full text-sm font-medium",
        score > 70 ? "bg-green-100 text-green-700" : score > 50 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"
      ), children: score > 70 ? "Good" : score > 50 ? "Needs Improvement" : "Poor" })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "space-y-2", children: suggestions && suggestions.map((suggestion, index) => /* @__PURE__ */ jsxs(
      "div",
      {
        className: cn(
          "flex items-start gap-2 p-3 rounded-lg",
          suggestion.type === "good" ? "bg-green-50" : "bg-yellow-50"
        ),
        children: [
          /* @__PURE__ */ jsx(
            "img",
            {
              src: suggestion.type === "good" ? "/icons/check.svg" : "/icons/warning.svg",
              alt: suggestion.type,
              className: "w-5 h-5 mt-0.5"
            }
          ),
          /* @__PURE__ */ jsx("p", { className: "text-sm", children: suggestion.tip })
        ]
      },
      index
    )) })
  ] });
};
const AccordionContext = createContext(void 0);
const useAccordion = () => {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error("Accordion components must be used within an Accordion");
  }
  return context;
};
const Accordion = ({ children, defaultOpen, allowMultiple = false, className = "" }) => {
  const [activeItems, setActiveItems] = useState(
    defaultOpen ? [defaultOpen] : []
  );
  const toggleItem = (id) => {
    setActiveItems((prev) => {
      if (allowMultiple) {
        return prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      } else {
        return prev.includes(id) ? [] : [id];
      }
    });
  };
  const isItemActive = (id) => activeItems.includes(id);
  return /* @__PURE__ */ jsx(AccordionContext.Provider, { value: { activeItems, toggleItem, isItemActive }, children: /* @__PURE__ */ jsx("div", { className: `space-y-2 ${className}`, children }) });
};
const AccordionItem = ({ id, children, className = "" }) => {
  return /* @__PURE__ */ jsx("div", { className: `overflow-hidden border-b border-gray-200 ${className}`, children });
};
const AccordionHeader = ({
  itemId,
  children,
  className = "",
  icon,
  iconPosition = "right"
}) => {
  const { toggleItem, isItemActive } = useAccordion();
  const isActive = isItemActive(itemId);
  const defaultIcon = /* @__PURE__ */ jsx(
    "svg",
    {
      className: cn("w-5 h-5 transition-transform duration-200", {
        "rotate-180": isActive
      }),
      fill: "none",
      stroke: "#98A2B3",
      viewBox: "0 0 24 24",
      xmlns: "http://www.w3.org/2000/svg",
      children: /* @__PURE__ */ jsx(
        "path",
        {
          strokeLinecap: "round",
          strokeLinejoin: "round",
          strokeWidth: 2,
          d: "M19 9l-7 7-7-7"
        }
      )
    }
  );
  const handleClick = () => {
    toggleItem(itemId);
  };
  return /* @__PURE__ */ jsxs(
    "button",
    {
      onClick: handleClick,
      className: `
        w-full px-4 py-3 text-left
        focus:outline-none
        transition-colors duration-200 flex items-center justify-between cursor-pointer
        ${className}
      `,
      children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-3", children: [
          iconPosition === "left" && (icon || defaultIcon),
          /* @__PURE__ */ jsx("div", { className: "flex-1", children })
        ] }),
        iconPosition === "right" && (icon || defaultIcon)
      ]
    }
  );
};
const AccordionContent = ({ itemId, children, className = "" }) => {
  const { isItemActive } = useAccordion();
  const isActive = isItemActive(itemId);
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: `
        overflow-hidden transition-all duration-300 ease-in-out
        ${isActive ? "max-h-fit opacity-100" : "max-h-0 opacity-0"}
        ${className}
      `,
      children: /* @__PURE__ */ jsx("div", { className: "px-4 py-3 ", children })
    }
  );
};
const ScoreBadge = ({ score }) => {
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: cn(
        "flex flex-row gap-1 items-center px-2 py-0.5 rounded-[96px]",
        score > 69 ? "bg-badge-green" : score > 39 ? "bg-badge-yellow" : "bg-badge-red"
      ),
      children: [
        /* @__PURE__ */ jsx(
          "img",
          {
            src: score > 69 ? "/icons/check.svg" : "/icons/warning.svg",
            alt: "score",
            className: "size-4"
          }
        ),
        /* @__PURE__ */ jsxs(
          "p",
          {
            className: cn(
              "text-sm font-medium",
              score > 69 ? "text-badge-green-text" : score > 39 ? "text-badge-yellow-text" : "text-badge-red-text"
            ),
            children: [
              score,
              "/100"
            ]
          }
        )
      ]
    }
  );
};
const CategoryHeader = ({ title, categoryScore }) => {
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-row gap-4 items-center py-2", children: [
    /* @__PURE__ */ jsx("p", { className: "text-2xl font-semibold", children: title }),
    /* @__PURE__ */ jsx(ScoreBadge, { score: categoryScore })
  ] });
};
const CategoryContent = ({ tips }) => {
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-4 items-center w-full", children: [
    /* @__PURE__ */ jsx("div", { className: "bg-gray-50 w-full rounded-lg px-5 py-4 grid grid-cols-2 gap-4", children: tips.map((tip, index) => /* @__PURE__ */ jsxs("div", { className: "flex flex-row gap-2 items-center", children: [
      /* @__PURE__ */ jsx(
        "img",
        {
          src: tip.type === "good" ? "/icons/check.svg" : "/icons/warning.svg",
          alt: "score",
          className: "size-5"
        }
      ),
      /* @__PURE__ */ jsx("p", { className: "text-xl text-gray-500 ", children: tip.tip })
    ] }, index)) }),
    /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-4 w-full", children: tips.map((tip, index) => /* @__PURE__ */ jsxs(
      "div",
      {
        className: cn(
          "flex flex-col gap-2 rounded-2xl p-4",
          tip.type === "good" ? "bg-green-50 border border-green-200 text-green-700" : "bg-yellow-50 border border-yellow-200 text-yellow-700"
        ),
        children: [
          /* @__PURE__ */ jsxs("div", { className: "flex flex-row gap-2 items-center", children: [
            /* @__PURE__ */ jsx(
              "img",
              {
                src: tip.type === "good" ? "/icons/check.svg" : "/icons/warning.svg",
                alt: "score",
                className: "size-5"
              }
            ),
            /* @__PURE__ */ jsx("p", { className: "text-xl font-semibold", children: tip.tip })
          ] }),
          /* @__PURE__ */ jsx("p", { children: tip.explanation })
        ]
      },
      index + tip.tip
    )) })
  ] });
};
const Details = ({ feedback }) => {
  return /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-4 w-full", children: /* @__PURE__ */ jsxs(Accordion, { children: [
    /* @__PURE__ */ jsxs(AccordionItem, { id: "tone-style", children: [
      /* @__PURE__ */ jsx(AccordionHeader, { itemId: "tone-style", children: /* @__PURE__ */ jsx(
        CategoryHeader,
        {
          title: "Tone & Style",
          categoryScore: feedback.toneAndStyle.score
        }
      ) }),
      /* @__PURE__ */ jsx(AccordionContent, { itemId: "tone-style", children: /* @__PURE__ */ jsx(CategoryContent, { tips: feedback.toneAndStyle.tips }) })
    ] }),
    /* @__PURE__ */ jsxs(AccordionItem, { id: "content", children: [
      /* @__PURE__ */ jsx(AccordionHeader, { itemId: "content", children: /* @__PURE__ */ jsx(
        CategoryHeader,
        {
          title: "Content",
          categoryScore: feedback.content.score
        }
      ) }),
      /* @__PURE__ */ jsx(AccordionContent, { itemId: "content", children: /* @__PURE__ */ jsx(CategoryContent, { tips: feedback.content.tips }) })
    ] }),
    /* @__PURE__ */ jsxs(AccordionItem, { id: "structure", children: [
      /* @__PURE__ */ jsx(AccordionHeader, { itemId: "structure", children: /* @__PURE__ */ jsx(
        CategoryHeader,
        {
          title: "Structure",
          categoryScore: feedback.structure.score
        }
      ) }),
      /* @__PURE__ */ jsx(AccordionContent, { itemId: "structure", children: /* @__PURE__ */ jsx(CategoryContent, { tips: feedback.structure.tips }) })
    ] }),
    /* @__PURE__ */ jsxs(AccordionItem, { id: "skills", children: [
      /* @__PURE__ */ jsx(AccordionHeader, { itemId: "skills", children: /* @__PURE__ */ jsx(
        CategoryHeader,
        {
          title: "Skills",
          categoryScore: feedback.skills.score
        }
      ) }),
      /* @__PURE__ */ jsx(AccordionContent, { itemId: "skills", children: /* @__PURE__ */ jsx(CategoryContent, { tips: feedback.skills.tips }) })
    ] })
  ] }) });
};
const meta$2 = () => [{
  title: "ElevateCV | Review "
}, {
  name: "description",
  content: "Detailed overview of your resume"
}];
const Resume = () => {
  const {
    auth: auth2,
    isLoading,
    fs,
    kv
  } = usePuterStore();
  const {
    id
  } = useParams();
  const [imageUrl, setImageUrl] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const [feedback, setFeedback] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    if (!isLoading && !auth2.isAuthenticated) navigate(`/auth?next=/resume/${id}`);
  }, [isLoading, auth2.isAuthenticated, navigate, id]);
  useEffect(() => {
    const loadResume = async () => {
      const resume2 = await kv.get(`resume:${id}`);
      if (!resume2) return;
      const data = JSON.parse(resume2);
      const resumeBlob = await fs.read(data.resumePath);
      if (!resumeBlob) return;
      const pdfBlob = new Blob([resumeBlob], {
        type: "application/pdf"
      });
      const resumeUrl2 = URL.createObjectURL(pdfBlob);
      setResumeUrl(resumeUrl2);
      const imageBlob = await fs.read(data.imagePath);
      if (!imageBlob) return;
      const imageUrl2 = URL.createObjectURL(imageBlob);
      setImageUrl(imageUrl2);
      setFeedback(data.feedback);
      console.log({
        resumeUrl: resumeUrl2,
        imageUrl: imageUrl2,
        feedback: data.feedback
      });
    };
    loadResume();
  }, [id, fs, kv]);
  return /* @__PURE__ */ jsxs("main", {
    className: "!pt-0",
    children: [/* @__PURE__ */ jsx("nav", {
      className: "resume-nav",
      children: /* @__PURE__ */ jsxs(Link, {
        to: "/",
        className: "back-button",
        children: [/* @__PURE__ */ jsx("img", {
          src: "/icons/back.svg",
          alt: "logo",
          className: "w-2.5 h-2.5"
        }), /* @__PURE__ */ jsx("span", {
          className: "text-gray-800 text-sm font-semibold",
          children: "Back to Homepage"
        })]
      })
    }), /* @__PURE__ */ jsxs("div", {
      className: "flex flex-row w-full max-lg:flex-col-reverse",
      children: [/* @__PURE__ */ jsx("section", {
        className: "feedback-section bg-[url('/images/bg-small.svg') bg-cover h-[100vh] sticky top-0 items-center justify-center",
        children: imageUrl && resumeUrl && /* @__PURE__ */ jsx("div", {
          className: "animate-in fade-in duration-1000 gradient-border max-sm:m-0 h-[90%] max-wxl:h-fit w-fit",
          children: /* @__PURE__ */ jsx("a", {
            href: resumeUrl,
            target: "_blank",
            rel: "noopener noreferrer",
            children: /* @__PURE__ */ jsx("img", {
              src: imageUrl,
              className: "w-full h-full object-contain rounded-2xl",
              title: "resume"
            })
          })
        })
      }), /* @__PURE__ */ jsxs("section", {
        className: "feedback-section",
        children: [/* @__PURE__ */ jsx("h2", {
          className: "text-4xl !text-black font-bold",
          children: "Resume Review"
        }), feedback ? /* @__PURE__ */ jsxs("div", {
          className: "flex flex-col gap-8 animate-in fade-in duration-1000",
          children: [/* @__PURE__ */ jsx(Summary, {
            feedback
          }), /* @__PURE__ */ jsx(ATS, {
            score: feedback.ATS.score || 0,
            suggestions: feedback.ATS.tips || []
          }), /* @__PURE__ */ jsx(Details, {
            feedback
          })]
        }) : /* @__PURE__ */ jsx("img", {
          src: "/images/resume-scan-2.gif",
          className: "w-full"
        })]
      })]
    })]
  });
};
const resume = UNSAFE_withComponentProps(Resume);
const route4 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: resume,
  meta: meta$2
}, Symbol.toStringTag, { value: "Module" }));
function meta$1() {
  return [{
    title: "Wipe Data | Resumind"
  }, {
    name: "description",
    content: "Clear all your resume data"
  }];
}
const Wipe = () => {
  const {
    auth: auth2,
    isLoading,
    kv
  } = usePuterStore();
  const navigate = useNavigate();
  const [isWiping, setIsWiping] = useState(false);
  const [statusText, setStatusText] = useState("");
  useEffect(() => {
    if (!isLoading && !auth2.isAuthenticated) {
      navigate("/auth?next=/wipe");
    }
  }, [isLoading, auth2.isAuthenticated, navigate]);
  const handleWipe = async () => {
    try {
      setIsWiping(true);
      setStatusText("Clearing all data...");
      await kv.flush();
      setStatusText("All data cleared successfully!");
      setTimeout(() => {
        navigate("/");
      }, 2e3);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setStatusText(`Error: ${errorMsg}`);
      setIsWiping(false);
    }
  };
  if (isWiping) {
    return /* @__PURE__ */ jsxs("main", {
      className: "bg-[url('/images/bg-main.svg')] bg-cover",
      children: [/* @__PURE__ */ jsx(Navbar, {}), /* @__PURE__ */ jsx("section", {
        className: "main-section",
        children: /* @__PURE__ */ jsxs("div", {
          className: "page-heading py-16",
          children: [/* @__PURE__ */ jsx("h1", {
            children: "Clearing Data"
          }), /* @__PURE__ */ jsx("h2", {
            children: statusText
          }), /* @__PURE__ */ jsx("img", {
            src: "/images/resume-scan.gif",
            className: "w-full"
          })]
        })
      })]
    });
  }
  return /* @__PURE__ */ jsxs("main", {
    className: "bg-[url('/images/bg-main.svg')] bg-cover",
    children: [/* @__PURE__ */ jsx(Navbar, {}), /* @__PURE__ */ jsx("section", {
      className: "main-section",
      children: /* @__PURE__ */ jsxs("div", {
        className: "page-heading py-16",
        children: [/* @__PURE__ */ jsx("h1", {
          children: "Clear All Data"
        }), /* @__PURE__ */ jsx("h2", {
          children: "This will permanently delete all your saved resumes and feedback."
        }), /* @__PURE__ */ jsxs("div", {
          className: "flex flex-col gap-4 mt-8 items-center",
          children: [/* @__PURE__ */ jsx("button", {
            onClick: handleWipe,
            className: "primary-button bg-red-500 hover:bg-red-600",
            children: "Delete All Data"
          }), /* @__PURE__ */ jsx(Link, {
            to: "/",
            className: "text-gray-500 hover:text-gray-700",
            children: "Cancel and go back"
          })]
        })]
      })
    })]
  });
};
const wipe = UNSAFE_withComponentProps(Wipe);
const route5 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: wipe,
  meta: meta$1
}, Symbol.toStringTag, { value: "Module" }));
const resumeTemplates = [
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
const getTemplatesByCategory = (category) => {
  return resumeTemplates.filter((template) => template.category === category);
};
const faangTemplates = getTemplatesByCategory("faang");
const techTemplates = getTemplatesByCategory("tech");
const meta = () => [{
  title: "JobFit AI"
}, {
  name: "description",
  content: "Create your professional resume with ready-made templates"
}];
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
    experience: [{
      company: "",
      role: "",
      duration: "",
      description: ""
    }],
    education: [{
      school: "",
      degree: "",
      year: "",
      gpa: ""
    }],
    projects: [{
      name: "",
      description: "",
      technologies: ""
    }],
    certifications: [""]
  });
  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setStep("fill");
  };
  const handleInputChange = (field, value) => {
    setResumeData((prev) => ({
      ...prev,
      [field]: value
    }));
  };
  const handleArrayFieldChange = (arrayName, index, field, value) => {
    setResumeData((prev) => {
      const newArray = [...prev[arrayName]];
      newArray[index] = {
        ...newArray[index],
        [field]: value
      };
      return {
        ...prev,
        [arrayName]: newArray
      };
    });
  };
  const addArrayItem = (arrayName, defaultItem) => {
    setResumeData((prev) => ({
      ...prev,
      [arrayName]: [...prev[arrayName], defaultItem]
    }));
  };
  const removeArrayItem = (arrayName, index) => {
    setResumeData((prev) => ({
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
  return /* @__PURE__ */ jsxs("main", {
    className: "bg-[url('/images/bg-main.svg')] bg-cover min-h-screen",
    children: [/* @__PURE__ */ jsx(Navbar, {}), /* @__PURE__ */ jsxs("section", {
      className: "main-section",
      children: [/* @__PURE__ */ jsxs("div", {
        className: "page-heading py-16",
        children: [/* @__PURE__ */ jsx("h1", {
          children: "Create Your Resume"
        }), step === "select" && /* @__PURE__ */ jsx("h2", {
          children: "Choose from our professionally designed templates"
        }), step === "fill" && selectedTemplate && /* @__PURE__ */ jsxs("h2", {
          children: ["Filling in: ", selectedTemplate.name]
        }), step === "preview" && /* @__PURE__ */ jsx("h2", {
          children: "Preview Your Resume"
        })]
      }), step === "select" && /* @__PURE__ */ jsx(TemplateSelector, {
        faangTemplates,
        techTemplates,
        onSelect: handleTemplateSelect
      }), step === "fill" && selectedTemplate && /* @__PURE__ */ jsx(ResumeForm, {
        template: selectedTemplate,
        resumeData,
        onChange: handleInputChange,
        onArrayChange: handleArrayFieldChange,
        onAdd: addArrayItem,
        onRemove: removeArrayItem,
        onSubmit: handleSubmit,
        onBack: goBack
      }), step === "preview" && selectedTemplate && /* @__PURE__ */ jsx(ResumePreview, {
        template: selectedTemplate,
        resumeData,
        onBack: goBack
      })]
    })]
  });
};
const TemplateSelector = ({
  faangTemplates: faangTemplates2,
  techTemplates: techTemplates2,
  onSelect
}) => {
  const [activeCategory, setActiveCategory] = useState("all");
  activeCategory === "all" ? [...faangTemplates2, ...techTemplates2] : activeCategory === "maang" ? faangTemplates2 : techTemplates2;
  return /* @__PURE__ */ jsxs("div", {
    className: "w-full max-w-6xl",
    children: [/* @__PURE__ */ jsxs("div", {
      className: "flex flex-row gap-4 mb-8 justify-center",
      children: [/* @__PURE__ */ jsx("button", {
        onClick: () => setActiveCategory("all"),
        className: `px-6 py-3 rounded-full font-semibold transition-all ${activeCategory === "all" ? "primary-gradient text-white" : "bg-white text-gray-600 border border-gray-200"}`,
        children: "All Templates"
      }), /* @__PURE__ */ jsx("button", {
        onClick: () => setActiveCategory("maang"),
        className: `px-6 py-3 rounded-full font-semibold transition-all ${activeCategory === "maang" ? "primary-gradient text-white" : "bg-white text-gray-600 border border-gray-200"}`,
        children: "MAANG Companies"
      }), /* @__PURE__ */ jsx("button", {
        onClick: () => setActiveCategory("tech"),
        className: `px-6 py-3 rounded-full font-semibold transition-all ${activeCategory === "tech" ? "primary-gradient text-white" : "bg-white text-gray-600 border border-gray-200"}`,
        children: "Tech Industry"
      })]
    }), (activeCategory === "all" || activeCategory === "maang") && /* @__PURE__ */ jsxs("div", {
      className: "mb-12",
      children: [/* @__PURE__ */ jsx("h3", {
        className: "text-2xl font-bold mb-6 text-gray-800",
        children: activeCategory === "all" ? "MAANG Companies" : "MAANG Companies"
      }), /* @__PURE__ */ jsx("div", {
        className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
        children: faangTemplates2.map((template) => /* @__PURE__ */ jsx(TemplateCard, {
          template,
          onSelect
        }, template.id))
      })]
    }), (activeCategory === "all" || activeCategory === "tech") && /* @__PURE__ */ jsxs("div", {
      children: [/* @__PURE__ */ jsx("h3", {
        className: "text-2xl font-bold mb-6 text-gray-800",
        children: activeCategory === "all" ? "Tech Industry" : "Tech Industry"
      }), /* @__PURE__ */ jsx("div", {
        className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
        children: techTemplates2.map((template) => /* @__PURE__ */ jsx(TemplateCard, {
          template,
          onSelect
        }, template.id))
      })]
    })]
  });
};
const TemplateCard = ({
  template,
  onSelect
}) => {
  return /* @__PURE__ */ jsxs("div", {
    className: "bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-indigo-500",
    onClick: () => onSelect(template),
    children: [/* @__PURE__ */ jsx("div", {
      className: "h-48 rounded-lg mb-4 flex items-center justify-center text-white font-bold text-2xl",
      style: {
        backgroundColor: template.style.primaryColor
      },
      children: template.name.split(" - ")[0]
    }), /* @__PURE__ */ jsx("h3", {
      className: "text-xl font-bold text-gray-800 mb-2",
      children: template.name
    }), /* @__PURE__ */ jsx("p", {
      className: "text-gray-600 text-sm mb-4",
      children: template.description
    }), /* @__PURE__ */ jsx("div", {
      className: "flex flex-wrap gap-2",
      children: template.sections.slice(0, 3).map((section) => /* @__PURE__ */ jsx("span", {
        className: "px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-600",
        children: section
      }, section))
    }), /* @__PURE__ */ jsx("button", {
      className: "w-full mt-4 primary-button",
      children: "Use Template"
    })]
  });
};
const ResumeForm = ({
  template,
  resumeData,
  onChange,
  onArrayChange,
  onAdd,
  onRemove,
  onSubmit,
  onBack
}) => {
  return /* @__PURE__ */ jsxs("form", {
    onSubmit,
    className: "w-full max-w-4xl bg-white rounded-2xl p-8 shadow-lg",
    children: [/* @__PURE__ */ jsxs("div", {
      className: "mb-8",
      children: [/* @__PURE__ */ jsx("h3", {
        className: "text-2xl font-bold mb-4 text-gray-800",
        children: "Personal Information"
      }), /* @__PURE__ */ jsxs("div", {
        className: "grid grid-cols-1 md:grid-cols-2 gap-4",
        children: [/* @__PURE__ */ jsxs("div", {
          className: "form-div",
          children: [/* @__PURE__ */ jsx("label", {
            children: "Full Name"
          }), /* @__PURE__ */ jsx("input", {
            type: "text",
            value: resumeData.fullName,
            onChange: (e) => onChange("fullName", e.target.value),
            placeholder: "John Doe",
            required: true
          })]
        }), /* @__PURE__ */ jsxs("div", {
          className: "form-div",
          children: [/* @__PURE__ */ jsx("label", {
            children: "Email"
          }), /* @__PURE__ */ jsx("input", {
            type: "email",
            value: resumeData.email,
            onChange: (e) => onChange("email", e.target.value),
            placeholder: "john@example.com",
            required: true
          })]
        }), /* @__PURE__ */ jsxs("div", {
          className: "form-div",
          children: [/* @__PURE__ */ jsx("label", {
            children: "Phone"
          }), /* @__PURE__ */ jsx("input", {
            type: "tel",
            value: resumeData.phone,
            onChange: (e) => onChange("phone", e.target.value),
            placeholder: "+1 (555) 123-4567"
          })]
        }), /* @__PURE__ */ jsxs("div", {
          className: "form-div",
          children: [/* @__PURE__ */ jsx("label", {
            children: "Location"
          }), /* @__PURE__ */ jsx("input", {
            type: "text",
            value: resumeData.location,
            onChange: (e) => onChange("location", e.target.value),
            placeholder: "San Francisco, CA"
          })]
        }), /* @__PURE__ */ jsxs("div", {
          className: "form-div",
          children: [/* @__PURE__ */ jsx("label", {
            children: "LinkedIn"
          }), /* @__PURE__ */ jsx("input", {
            type: "url",
            value: resumeData.linkedin,
            onChange: (e) => onChange("linkedin", e.target.value),
            placeholder: "linkedin.com/in/johndoe"
          })]
        }), /* @__PURE__ */ jsxs("div", {
          className: "form-div",
          children: [/* @__PURE__ */ jsx("label", {
            children: "GitHub"
          }), /* @__PURE__ */ jsx("input", {
            type: "url",
            value: resumeData.github,
            onChange: (e) => onChange("github", e.target.value),
            placeholder: "github.com/johndoe"
          })]
        })]
      })]
    }), /* @__PURE__ */ jsxs("div", {
      className: "mb-8",
      children: [/* @__PURE__ */ jsx("h3", {
        className: "text-2xl font-bold mb-4 text-gray-800",
        children: "Professional Summary"
      }), /* @__PURE__ */ jsx("div", {
        className: "form-div",
        children: /* @__PURE__ */ jsx("textarea", {
          rows: 4,
          value: resumeData.summary,
          onChange: (e) => onChange("summary", e.target.value),
          placeholder: "Write a brief summary of your professional background and career goals..."
        })
      })]
    }), /* @__PURE__ */ jsxs("div", {
      className: "mb-8",
      children: [/* @__PURE__ */ jsx("h3", {
        className: "text-2xl font-bold mb-4 text-gray-800",
        children: "Skills"
      }), /* @__PURE__ */ jsx("div", {
        className: "form-div",
        children: /* @__PURE__ */ jsx("textarea", {
          rows: 3,
          value: resumeData.skills,
          onChange: (e) => onChange("skills", e.target.value),
          placeholder: "JavaScript, React, Node.js, Python, AWS, Docker..."
        })
      })]
    }), /* @__PURE__ */ jsxs("div", {
      className: "mb-8",
      children: [/* @__PURE__ */ jsxs("div", {
        className: "flex justify-between items-center mb-4",
        children: [/* @__PURE__ */ jsx("h3", {
          className: "text-2xl font-bold text-gray-800",
          children: "Experience"
        }), /* @__PURE__ */ jsx("button", {
          type: "button",
          onClick: () => onAdd("experience", {
            company: "",
            role: "",
            duration: "",
            description: ""
          }),
          className: "px-4 py-2 bg-indigo-100 text-indigo-600 rounded-lg font-medium hover:bg-indigo-200",
          children: "+ Add Experience"
        })]
      }), resumeData.experience.map((exp, index) => /* @__PURE__ */ jsxs("div", {
        className: "mb-6 p-4 bg-gray-50 rounded-xl",
        children: [/* @__PURE__ */ jsxs("div", {
          className: "grid grid-cols-1 md:grid-cols-2 gap-4 mb-4",
          children: [/* @__PURE__ */ jsxs("div", {
            className: "form-div",
            children: [/* @__PURE__ */ jsx("label", {
              children: "Company"
            }), /* @__PURE__ */ jsx("input", {
              type: "text",
              value: exp.company,
              onChange: (e) => onArrayChange("experience", index, "company", e.target.value),
              placeholder: "Company Name"
            })]
          }), /* @__PURE__ */ jsxs("div", {
            className: "form-div",
            children: [/* @__PURE__ */ jsx("label", {
              children: "Role"
            }), /* @__PURE__ */ jsx("input", {
              type: "text",
              value: exp.role,
              onChange: (e) => onArrayChange("experience", index, "role", e.target.value),
              placeholder: "Job Title"
            })]
          }), /* @__PURE__ */ jsxs("div", {
            className: "form-div",
            children: [/* @__PURE__ */ jsx("label", {
              children: "Duration"
            }), /* @__PURE__ */ jsx("input", {
              type: "text",
              value: exp.duration,
              onChange: (e) => onArrayChange("experience", index, "duration", e.target.value),
              placeholder: "Jan 2020 - Present"
            })]
          })]
        }), /* @__PURE__ */ jsxs("div", {
          className: "form-div",
          children: [/* @__PURE__ */ jsx("label", {
            children: "Description"
          }), /* @__PURE__ */ jsx("textarea", {
            rows: 3,
            value: exp.description,
            onChange: (e) => onArrayChange("experience", index, "description", e.target.value),
            placeholder: "Describe your responsibilities and achievements..."
          })]
        }), resumeData.experience.length > 1 && /* @__PURE__ */ jsx("button", {
          type: "button",
          onClick: () => onRemove("experience", index),
          className: "mt-2 text-red-500 text-sm hover:underline",
          children: "Remove"
        })]
      }, index))]
    }), /* @__PURE__ */ jsxs("div", {
      className: "mb-8",
      children: [/* @__PURE__ */ jsxs("div", {
        className: "flex justify-between items-center mb-4",
        children: [/* @__PURE__ */ jsx("h3", {
          className: "text-2xl font-bold text-gray-800",
          children: "Education"
        }), /* @__PURE__ */ jsx("button", {
          type: "button",
          onClick: () => onAdd("education", {
            school: "",
            degree: "",
            year: "",
            gpa: ""
          }),
          className: "px-4 py-2 bg-indigo-100 text-indigo-600 rounded-lg font-medium hover:bg-indigo-200",
          children: "+ Add Education"
        })]
      }), resumeData.education.map((edu, index) => /* @__PURE__ */ jsxs("div", {
        className: "mb-6 p-4 bg-gray-50 rounded-xl",
        children: [/* @__PURE__ */ jsxs("div", {
          className: "grid grid-cols-1 md:grid-cols-2 gap-4",
          children: [/* @__PURE__ */ jsxs("div", {
            className: "form-div",
            children: [/* @__PURE__ */ jsx("label", {
              children: "School"
            }), /* @__PURE__ */ jsx("input", {
              type: "text",
              value: edu.school,
              onChange: (e) => onArrayChange("education", index, "school", e.target.value),
              placeholder: "University Name"
            })]
          }), /* @__PURE__ */ jsxs("div", {
            className: "form-div",
            children: [/* @__PURE__ */ jsx("label", {
              children: "Degree"
            }), /* @__PURE__ */ jsx("input", {
              type: "text",
              value: edu.degree,
              onChange: (e) => onArrayChange("education", index, "degree", e.target.value),
              placeholder: "Bachelor of Science in Computer Science"
            })]
          }), /* @__PURE__ */ jsxs("div", {
            className: "form-div",
            children: [/* @__PURE__ */ jsx("label", {
              children: "Year"
            }), /* @__PURE__ */ jsx("input", {
              type: "text",
              value: edu.year,
              onChange: (e) => onArrayChange("education", index, "year", e.target.value),
              placeholder: "2016 - 2020"
            })]
          }), /* @__PURE__ */ jsxs("div", {
            className: "form-div",
            children: [/* @__PURE__ */ jsx("label", {
              children: "GPA (Optional)"
            }), /* @__PURE__ */ jsx("input", {
              type: "text",
              value: edu.gpa,
              onChange: (e) => onArrayChange("education", index, "gpa", e.target.value),
              placeholder: "3.8/4.0"
            })]
          })]
        }), resumeData.education.length > 1 && /* @__PURE__ */ jsx("button", {
          type: "button",
          onClick: () => onRemove("education", index),
          className: "mt-2 text-red-500 text-sm hover:underline",
          children: "Remove"
        })]
      }, index))]
    }), /* @__PURE__ */ jsxs("div", {
      className: "mb-8",
      children: [/* @__PURE__ */ jsxs("div", {
        className: "flex justify-between items-center mb-4",
        children: [/* @__PURE__ */ jsx("h3", {
          className: "text-2xl font-bold text-gray-800",
          children: "Projects"
        }), /* @__PURE__ */ jsx("button", {
          type: "button",
          onClick: () => onAdd("projects", {
            name: "",
            description: "",
            technologies: ""
          }),
          className: "px-4 py-2 bg-indigo-100 text-indigo-600 rounded-lg font-medium hover:bg-indigo-200",
          children: "+ Add Project"
        })]
      }), resumeData.projects.map((project, index) => /* @__PURE__ */ jsxs("div", {
        className: "mb-6 p-4 bg-gray-50 rounded-xl",
        children: [/* @__PURE__ */ jsxs("div", {
          className: "form-div mb-4",
          children: [/* @__PURE__ */ jsx("label", {
            children: "Project Name"
          }), /* @__PURE__ */ jsx("input", {
            type: "text",
            value: project.name,
            onChange: (e) => onArrayChange("projects", index, "name", e.target.value),
            placeholder: "Project Name"
          })]
        }), /* @__PURE__ */ jsxs("div", {
          className: "form-div mb-4",
          children: [/* @__PURE__ */ jsx("label", {
            children: "Description"
          }), /* @__PURE__ */ jsx("textarea", {
            rows: 2,
            value: project.description,
            onChange: (e) => onArrayChange("projects", index, "description", e.target.value),
            placeholder: "Brief description of the project..."
          })]
        }), /* @__PURE__ */ jsxs("div", {
          className: "form-div",
          children: [/* @__PURE__ */ jsx("label", {
            children: "Technologies Used"
          }), /* @__PURE__ */ jsx("input", {
            type: "text",
            value: project.technologies,
            onChange: (e) => onArrayChange("projects", index, "technologies", e.target.value),
            placeholder: "React, Node.js, MongoDB"
          })]
        }), resumeData.projects.length > 1 && /* @__PURE__ */ jsx("button", {
          type: "button",
          onClick: () => onRemove("projects", index),
          className: "mt-2 text-red-500 text-sm hover:underline",
          children: "Remove"
        })]
      }, index))]
    }), /* @__PURE__ */ jsxs("div", {
      className: "mb-8 p-4 bg-blue-50 rounded-xl",
      children: [/* @__PURE__ */ jsxs("h4", {
        className: "font-bold text-blue-800 mb-2",
        children: ["💡 Tips for ", template.company || "this template"]
      }), /* @__PURE__ */ jsx("p", {
        className: "text-blue-700",
        children: template.tips || "Fill in your details accurately and highlight your achievements."
      })]
    }), /* @__PURE__ */ jsxs("div", {
      className: "flex flex-row gap-4",
      children: [/* @__PURE__ */ jsx("button", {
        type: "button",
        onClick: onBack,
        className: "flex-1 py-4 border-2 border-gray-300 rounded-full font-semibold text-gray-600 hover:bg-gray-50",
        children: "Back"
      }), /* @__PURE__ */ jsx("button", {
        type: "submit",
        className: "flex-1 primary-button",
        children: "Preview Resume"
      })]
    })]
  });
};
const ResumePreview = ({
  template,
  resumeData,
  onBack
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      const html2pdfModule = await import("html2pdf.js");
      const html2pdf = html2pdfModule.default;
      const element = document.getElementById("resume-preview");
      const opt = {
        margin: 0,
        filename: `${resumeData.fullName || "resume"}.pdf`,
        image: {
          type: "jpeg",
          quality: 0.98
        },
        html2canvas: {
          scale: 2
        },
        jsPDF: {
          unit: "mm",
          format: "a4",
          orientation: "portrait"
        }
      };
      await html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    }
    setIsGenerating(false);
  };
  const getTextColor = () => template.style.primaryColor;
  return /* @__PURE__ */ jsxs("div", {
    className: "w-full max-w-6xl",
    children: [/* @__PURE__ */ jsxs("div", {
      className: "flex flex-row gap-4 mb-8 justify-center",
      children: [/* @__PURE__ */ jsx("button", {
        onClick: onBack,
        className: "px-6 py-3 border-2 border-gray-300 rounded-full font-semibold text-gray-600 hover:bg-gray-50",
        children: "← Edit Details"
      }), /* @__PURE__ */ jsx("button", {
        onClick: handleDownload,
        disabled: isGenerating,
        className: "px-6 py-3 primary-gradient text-white rounded-full font-semibold disabled:opacity-50",
        children: isGenerating ? "Generating PDF..." : "Download PDF"
      })]
    }), /* @__PURE__ */ jsx("div", {
      className: "flex justify-center",
      children: /* @__PURE__ */ jsxs("div", {
        id: "resume-preview",
        className: "bg-white shadow-2xl",
        style: {
          width: "210mm",
          minHeight: "297mm",
          padding: "20mm",
          fontFamily: template.style.fontFamily
        },
        children: [/* @__PURE__ */ jsxs("div", {
          className: "border-b-2 pb-4 mb-6",
          style: {
            borderColor: getTextColor()
          },
          children: [/* @__PURE__ */ jsx("h1", {
            className: "text-3xl font-bold mb-2",
            style: {
              color: template.style.headerStyle === "minimal" ? "#000" : getTextColor()
            },
            children: resumeData.fullName || "Your Name"
          }), /* @__PURE__ */ jsxs("div", {
            className: "flex flex-wrap gap-4 text-sm text-gray-600",
            children: [resumeData.email && /* @__PURE__ */ jsxs("span", {
              children: ["✉ ", resumeData.email]
            }), resumeData.phone && /* @__PURE__ */ jsxs("span", {
              children: ["📞 ", resumeData.phone]
            }), resumeData.location && /* @__PURE__ */ jsxs("span", {
              children: ["📍 ", resumeData.location]
            }), resumeData.linkedin && /* @__PURE__ */ jsxs("span", {
              children: ["LinkedIn: ", resumeData.linkedin]
            }), resumeData.github && /* @__PURE__ */ jsxs("span", {
              children: ["GitHub: ", resumeData.github]
            })]
          })]
        }), resumeData.summary && /* @__PURE__ */ jsxs("div", {
          className: "mb-6",
          children: [/* @__PURE__ */ jsx("h2", {
            className: "text-lg font-bold mb-2",
            style: {
              color: getTextColor()
            },
            children: "Professional Summary"
          }), /* @__PURE__ */ jsx("p", {
            className: "text-gray-700 text-sm leading-relaxed",
            children: resumeData.summary
          })]
        }), resumeData.skills && /* @__PURE__ */ jsxs("div", {
          className: "mb-6",
          children: [/* @__PURE__ */ jsx("h2", {
            className: "text-lg font-bold mb-2",
            style: {
              color: getTextColor()
            },
            children: "Skills"
          }), /* @__PURE__ */ jsx("p", {
            className: "text-gray-700 text-sm",
            children: resumeData.skills
          })]
        }), resumeData.experience.some((exp) => exp.company || exp.role) && /* @__PURE__ */ jsxs("div", {
          className: "mb-6",
          children: [/* @__PURE__ */ jsx("h2", {
            className: "text-lg font-bold mb-3",
            style: {
              color: getTextColor()
            },
            children: "Experience"
          }), resumeData.experience.map((exp, index) => (exp.company || exp.role) && /* @__PURE__ */ jsxs("div", {
            className: "mb-4",
            children: [/* @__PURE__ */ jsxs("div", {
              className: "flex justify-between items-baseline mb-1",
              children: [/* @__PURE__ */ jsx("h3", {
                className: "font-semibold text-gray-800",
                children: exp.role || "Role"
              }), /* @__PURE__ */ jsx("span", {
                className: "text-sm text-gray-500",
                children: exp.duration
              })]
            }), /* @__PURE__ */ jsx("p", {
              className: "font-medium text-gray-600 mb-1",
              children: exp.company
            }), exp.description && /* @__PURE__ */ jsx("p", {
              className: "text-gray-700 text-sm leading-relaxed whitespace-pre-line",
              children: exp.description
            })]
          }, index))]
        }), resumeData.education.some((edu) => edu.school || edu.degree) && /* @__PURE__ */ jsxs("div", {
          className: "mb-6",
          children: [/* @__PURE__ */ jsx("h2", {
            className: "text-lg font-bold mb-3",
            style: {
              color: getTextColor()
            },
            children: "Education"
          }), resumeData.education.map((edu, index) => (edu.school || edu.degree) && /* @__PURE__ */ jsxs("div", {
            className: "mb-3",
            children: [/* @__PURE__ */ jsxs("div", {
              className: "flex justify-between items-baseline mb-1",
              children: [/* @__PURE__ */ jsx("h3", {
                className: "font-semibold text-gray-800",
                children: edu.school
              }), /* @__PURE__ */ jsx("span", {
                className: "text-sm text-gray-500",
                children: edu.year
              })]
            }), /* @__PURE__ */ jsxs("p", {
              className: "text-gray-600",
              children: [edu.degree, edu.gpa && ` • GPA: ${edu.gpa}`]
            })]
          }, index))]
        }), resumeData.projects.some((proj) => proj.name) && /* @__PURE__ */ jsxs("div", {
          className: "mb-6",
          children: [/* @__PURE__ */ jsx("h2", {
            className: "text-lg font-bold mb-3",
            style: {
              color: getTextColor()
            },
            children: "Projects"
          }), resumeData.projects.map((project, index) => project.name && /* @__PURE__ */ jsxs("div", {
            className: "mb-3",
            children: [/* @__PURE__ */ jsx("h3", {
              className: "font-semibold text-gray-800",
              children: project.name
            }), project.description && /* @__PURE__ */ jsx("p", {
              className: "text-gray-700 text-sm mb-1",
              children: project.description
            }), project.technologies && /* @__PURE__ */ jsxs("p", {
              className: "text-sm",
              style: {
                color: getTextColor()
              },
              children: [/* @__PURE__ */ jsx("strong", {
                children: "Technologies:"
              }), " ", project.technologies]
            })]
          }, index))]
        })]
      })
    })]
  });
};
const builder = UNSAFE_withComponentProps(Builder);
const route6 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: builder,
  meta
}, Symbol.toStringTag, { value: "Module" }));
const serverManifest = { "entry": { "module": "/assets/entry.client-BpdvljNu.js", "imports": ["/assets/chunk-EPOLDU6W-BbN4KRE8.js"], "css": [] }, "routes": { "root": { "id": "root", "parentId": void 0, "path": "", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": true, "module": "/assets/root-DMUOwuU2.js", "imports": ["/assets/chunk-EPOLDU6W-BbN4KRE8.js", "/assets/puter-CxLeiHHH.js"], "css": ["/assets/root-d-JAi7Js.css"], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/home": { "id": "routes/home", "parentId": "root", "path": void 0, "index": true, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/home-5JsYKKut.js", "imports": ["/assets/chunk-EPOLDU6W-BbN4KRE8.js", "/assets/Navbar-BCP2X6ZB.js", "/assets/puter-CxLeiHHH.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/auth": { "id": "routes/auth", "parentId": "root", "path": "/auth", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/auth-DiG_GIk6.js", "imports": ["/assets/chunk-EPOLDU6W-BbN4KRE8.js", "/assets/puter-CxLeiHHH.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/upload": { "id": "routes/upload", "parentId": "root", "path": "/upload", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/upload-CszuPdt8.js", "imports": ["/assets/chunk-EPOLDU6W-BbN4KRE8.js", "/assets/Navbar-BCP2X6ZB.js", "/assets/utils-D9lRg291.js", "/assets/preload-helper-BXl3LOEh.js", "/assets/puter-CxLeiHHH.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/resume": { "id": "routes/resume", "parentId": "root", "path": "/resume/:id", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/resume-CEaqGcuO.js", "imports": ["/assets/chunk-EPOLDU6W-BbN4KRE8.js", "/assets/puter-CxLeiHHH.js", "/assets/utils-D9lRg291.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/wipe": { "id": "routes/wipe", "parentId": "root", "path": "/wipe", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/wipe-Qp-inzMX.js", "imports": ["/assets/chunk-EPOLDU6W-BbN4KRE8.js", "/assets/puter-CxLeiHHH.js", "/assets/Navbar-BCP2X6ZB.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/builder": { "id": "routes/builder", "parentId": "root", "path": "/builder", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/builder-CnBjlhCm.js", "imports": ["/assets/preload-helper-BXl3LOEh.js", "/assets/chunk-EPOLDU6W-BbN4KRE8.js", "/assets/Navbar-BCP2X6ZB.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 } }, "url": "/assets/manifest-ea3ac7b1.js", "version": "ea3ac7b1", "sri": void 0 };
const assetsBuildDirectory = "build\\client";
const basename = "/";
const future = { "unstable_optimizeDeps": false, "unstable_subResourceIntegrity": false, "unstable_trailingSlashAwareDataRequests": false, "v8_middleware": false, "v8_splitRouteModules": false, "v8_viteEnvironmentApi": false };
const ssr = true;
const isSpaMode = false;
const prerender = [];
const routeDiscovery = { "mode": "lazy", "manifestPath": "/__manifest" };
const publicPath = "/";
const entry = { module: entryServer };
const routes = {
  "root": {
    id: "root",
    parentId: void 0,
    path: "",
    index: void 0,
    caseSensitive: void 0,
    module: route0
  },
  "routes/home": {
    id: "routes/home",
    parentId: "root",
    path: void 0,
    index: true,
    caseSensitive: void 0,
    module: route1
  },
  "routes/auth": {
    id: "routes/auth",
    parentId: "root",
    path: "/auth",
    index: void 0,
    caseSensitive: void 0,
    module: route2
  },
  "routes/upload": {
    id: "routes/upload",
    parentId: "root",
    path: "/upload",
    index: void 0,
    caseSensitive: void 0,
    module: route3
  },
  "routes/resume": {
    id: "routes/resume",
    parentId: "root",
    path: "/resume/:id",
    index: void 0,
    caseSensitive: void 0,
    module: route4
  },
  "routes/wipe": {
    id: "routes/wipe",
    parentId: "root",
    path: "/wipe",
    index: void 0,
    caseSensitive: void 0,
    module: route5
  },
  "routes/builder": {
    id: "routes/builder",
    parentId: "root",
    path: "/builder",
    index: void 0,
    caseSensitive: void 0,
    module: route6
  }
};
const allowedActionOrigins = false;
export {
  allowedActionOrigins,
  serverManifest as assets,
  assetsBuildDirectory,
  basename,
  entry,
  future,
  isSpaMode,
  prerender,
  publicPath,
  routeDiscovery,
  routes,
  ssr
};
