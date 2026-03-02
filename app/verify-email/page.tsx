// "use client";

// import { useSearchParams, useRouter } from "next/navigation";
// import { useState } from "react";

// export default function VerifyEmailPage() {
//   const searchParams = useSearchParams();
//   const router = useRouter();
//   const token = searchParams.get("token");

//   const [loading, setLoading] = useState(false);
//   const [status, setStatus] = useState<
//     "idle" | "success" | "error"
//   >("idle");
//   const [message, setMessage] = useState("");

//   const handleVerify = async () => {
//     if (!token) {
//       setStatus("error");
//       setMessage("Invalid verification link.");
//       return;
//     }

//     setLoading(true);

//     try {
//       const res = await fetch("/api/auth/verify-email", {
//         method: "POST",
//         body: JSON.stringify({ token }),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         setStatus("error");
//         setMessage(data.message || "Verification failed");
//       } else {
//         setStatus("success");
//         setMessage(data.message);
//       }
//     } catch {
//       setStatus("error");
//       setMessage("Something went wrong.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
//       <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 text-center">

//         {/* ICON */}
//         {status === "success" ? (
//           <div className="text-green-500 text-5xl mb-4">✔</div>
//         ) : status === "error" ? (
//           <div className="text-red-500 text-5xl mb-4">✖</div>
//         ) : (
//           <div className="text-blue-500 text-5xl mb-4">✉</div>
//         )}

//         {/* TITLE */}
//         <h1 className="text-2xl font-semibold mb-2">
//           Email Verification
//         </h1>

//         {/* DESCRIPTION */}
//         {status === "idle" && (
//           <p className="text-gray-600 mb-6">
//             Click the button below to verify your email address.
//           </p>
//         )}

//         {status !== "idle" && (
//           <p
//             className={`mb-6 ${
//               status === "success"
//                 ? "text-green-600"
//                 : "text-red-600"
//             }`}
//           >
//             {message}
//           </p>
//         )}

//         {/* BUTTON */}
//         {status === "idle" && (
//           <button
//             onClick={handleVerify}
//             disabled={loading}
//             className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition disabled:opacity-50"
//           >
//             {loading ? "Verifying..." : "Confirm Verification"}
//           </button>
//         )}

//         {/* SUCCESS ACTION */}
//         {status === "success" && (
//           <button
//             onClick={() => router.push("/login")}
//             className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-xl transition"
//           >
//             Go to Login
//           </button>
//         )}
//       </div>
//     </div>
//   );
// }

"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function VerifyEmailClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  const handleVerify = async () => {
    if (!token) {
      setStatus("error");
      setMessage("Invalid or expired verification link.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setMessage(data.message || "Verification failed.");
      } else {
        setStatus("success");
        setMessage(data.message || "Email successfully verified.");
      }
    } catch (err) {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Auto verify saat halaman dibuka
  useEffect(() => {
    if (token) {
      handleVerify();
    }
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 text-center">

        {/* ICON */}
        {status === "success" ? (
          <div className="text-green-500 text-5xl mb-4">✔</div>
        ) : status === "error" ? (
          <div className="text-red-500 text-5xl mb-4">✖</div>
        ) : (
          <div className="text-blue-500 text-5xl mb-4">
            {loading ? "⏳" : "✉"}
          </div>
        )}

        <h1 className="text-2xl font-semibold mb-2">
          Email Verification
        </h1>

        {status === "idle" && !loading && (
          <p className="text-gray-600 mb-6">
            Verifying your email address...
          </p>
        )}

        {status !== "idle" && (
          <p
            className={`mb-6 ${
              status === "success"
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {message}
          </p>
        )}

        {/* Retry Button */}
        {status === "error" && (
          <button
            onClick={handleVerify}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition disabled:opacity-50"
          >
            Try Again
          </button>
        )}

        {/* Success Action */}
        {status === "success" && (
          <button
            onClick={() => router.push("/login")}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-xl transition"
          >
            Go to Login
          </button>
        )}
      </div>
    </div>
  );
}