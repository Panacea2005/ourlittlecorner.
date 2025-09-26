"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import GradientSakura from "@/components/gradient-sakura";
import { useAuth } from "@/app/contexts/AuthContext";

export default function AuthPage() {
  // Form state
  const [isSignIn, setIsSignIn] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const { signIn, signUp } = useAuth();
  const router = useRouter();

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      if (isSignIn) {
        // Handle sign in
        const { error } = await signIn(email, password);
        if (error) {
          throw error;
        }

        setIsSubmitted(true);

        // Redirect to home page after successful login
        setTimeout(() => {
          router.push("/");
        }, 1500);
      } else {
        // Handle sign up
        const { error } = await signUp(email, password, name);
        if (error) {
          throw error;
        }
        // Show success notification and immediately switch to Sign In
        setSuccessMessage("Account created! Please sign in.");
        setIsSignIn(true);
        setIsSubmitted(false);
        setIsLoading(false);
        // Keep email to streamline sign in; clear password & name
        setPassword("");
        setName("");
        return;
      }
    } catch (error: any) {
      setErrorMessage(
        error.message || "An error occurred during authentication"
      );
      setIsLoading(false);
    }
  };

  // Social login removed

  return (
    <main className="relative w-full h-screen overflow-hidden flex">
      {/* Full screen background with multiple concentric sakura gradients on white */}
      <div className="absolute inset-0 bg-white overflow-hidden">
        {/* Rings container centered (2D layout) */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          {/* Ring 1 (inner) - smallest, few items */}
          {[0, 90, 180, 270].map((deg) => (
            <div
              key={`r1-${deg}`}
              className="absolute opacity-35"
              style={{ transform: `rotate(${deg}deg) translate(15vh) rotate(-${deg}deg) scale(0.2)` }}
            >
              <GradientSakura />
            </div>
          ))}

          {/* Ring 2 */}
          {[0, 72, 144, 216, 288].map((deg) => (
            <div
              key={`r2-${deg}`}
              className="absolute opacity-40"
              style={{ transform: `rotate(${deg}deg) translate(40vh) rotate(-${deg}deg) scale(0.2)` }}
            >
              <GradientSakura />
            </div>
          ))}

          {/* Ring 3 */}
          {[0, 60, 120, 180, 240, 300].map((deg) => (
            <div
              key={`r3-${deg}`}
              className="absolute opacity-45"
              style={{ transform: `rotate(${deg}deg) translate(65vh) rotate(-${deg}deg) scale(0.2)` }}
            >
              <GradientSakura />
            </div>
          ))}

          {/* Ring 4 (outer) - largest */}
          {[0, 51.43, 102.86, 154.29, 205.72, 257.15, 308.58].map((deg) => (
            <div
              key={`r4-${deg}`}
              className="absolute opacity-50"
              style={{ transform: `rotate(${deg}deg) translate(90vh) rotate(-${deg}deg) scale(0.2)` }}
            >
              <GradientSakura />
            </div>
          ))}
        </div>
      </div>

      {/* Logo in the corner - EXACT same as navbar */}
      <Link href="/" className="absolute top-6 left-6 z-30">
        <motion.div
          className="relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {/* Logo - same as navbar */}
          <span className="text-xl font-light tracking-wide text-gray-800 font-handwriting">
            ourlittlecorner.
          </span>
        </motion.div>
      </Link>

      {/* Right side auth panel with light theme grainy effect */}
      <div className="absolute right-0 top-0 bottom-0 w-[45%] min-w-[500px] z-20">
        {/* Light panel with grainy texture */}
        <motion.div
          className="h-full w-full bg-white/70 flex flex-col border-l border-white/40"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
        >
          {/* Grainy texture overlay */}
          <div
            className="absolute inset-0 opacity-20 mix-blend-overlay"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
              backgroundSize: "150px 150px",
            }}
          />

          {/* Content container with adjusted layout */}
          <div className="relative z-10 flex flex-col h-full px-16 pt-16 pb-8">
            {/* Welcome text at the top */}
            <motion.div
              className="mb-16"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <h1 className="text-gray-800 text-4xl font-light mb-2 font-handwriting">
                {isSignIn ? "Welcome back to our little corner" : "Join ourlittlecorner"}
              </h1>
              {!isSignIn ? (
                <p className="text-sm text-gray-600 font-light">
                  A cozy space for memories, journals, and special days.
                </p>
              ) : (
                <p className="text-sm text-gray-600 font-light">
                  Good to see you. Let's continue where we left off.
                </p>
              )}

              <div className="flex items-center text-sm text-gray-600 font-light">
                <span>
                  {isSignIn
                    ? "Don't have an account?"
                    : "Already have an account?"}
                </span>
                <button
                  className="ml-2 text-indigo-600 hover:text-indigo-800 transition-colors"
                  onClick={() => {
                    setIsSignIn(!isSignIn);
                    setErrorMessage("");
                  }}
                >
                  {isSignIn ? "Sign Up" : "Sign In"}
                </button>
              </div>
            </motion.div>

            {/* Flex spacer to push form to bottom */}
            <div className="flex-grow"></div>

            {/* Form container positioned at bottom */}
            <div className="mb-8">
              {/* Error / Success message */}
              {errorMessage && (
                <motion.div
                  className="mb-4 p-4 bg-red-50 border border-red-100 rounded-md text-sm text-red-600"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {errorMessage}
                </motion.div>
              )}
              {successMessage && (
                <motion.div
                  className="mb-4 p-4 bg-green-50 border border-green-100 rounded-md text-sm text-green-700"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {successMessage}
                </motion.div>
              )}

              <AnimatePresence mode="wait">
                <motion.form
                  key={isSignIn ? "signin" : "signup"}
                  className="space-y-6"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4 }}
                  onSubmit={handleSubmit}
                >
                  {/* Name field for signup only */}
                  {!isSignIn && (
                    <motion.div
                      className="space-y-1"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <label className="block text-xs text-gray-600 font-light">
                        Name
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-transparent border-b border-gray-300 px-0 py-3 text-gray-800 text-sm focus:outline-none focus:border-b-gray-500 transition-colors"
                        placeholder="Your name"
                        required
                      />
                    </motion.div>
                  )}

                  {/* Email field with underline style like in reference */}
                  <div className="space-y-1">
                    <label className="block text-xs text-gray-600 font-light">
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-transparent border-b border-gray-300 px-0 py-3 text-gray-800 text-sm focus:outline-none focus:border-b-gray-500 transition-colors"
                      placeholder="your@email.com"
                      required
                    />
                  </div>

                  {/* Password field with underline style */}
                  <div className="space-y-1">
                    <label className="block text-xs text-gray-600 font-light">
                      Password
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-transparent border-b border-gray-300 px-0 py-3 text-gray-800 text-sm focus:outline-none focus:border-b-gray-500 transition-colors"
                      placeholder="••••••••"
                      required
                    />
                  </div>

                  {/* Submit button - dark with uppercase text */}
                  <motion.button
                    type="submit"
                    className="w-full rounded px-4 py-3 mt-8 text-xs uppercase tracking-widest text-white bg-black hover:bg-gray-800 relative overflow-hidden transition-colors"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    disabled={isLoading || isSubmitted}
                  >
                    {/* Button text */}
                    <div className="relative z-10 flex items-center justify-center">
                      <AnimatePresence mode="wait">
                        {isLoading ? (
                          <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"
                          />
                        ) : isSubmitted ? (
                          <motion.svg
                            key="check"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="w-5 h-5"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M5 13l4 4L19 7" />
                          </motion.svg>
                        ) : (
                          <motion.span
                            key="button-text"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                          >
                            {isSignIn ? "Enter with Email" : "Create Account"}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.button>
                </motion.form>
              </AnimatePresence>
            </div>

            {/* Social login removed */}

            {/* Terms of service text */}
            <div className="text-xs text-gray-500 font-light leading-relaxed">
              By signing up, you agree to our{" "}
              <a
                href="#"
                className="text-pink-600 hover:text-pink-800 transition-colors"
              >
                Promise of Love
              </a>{" "}
              and{" "}
              <a
                href="#"
                className="text-pink-600 hover:text-pink-800 transition-colors"
              >
                Eternal Devotion
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
