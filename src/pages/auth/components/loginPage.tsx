
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { EyeIcon, EyeOffIcon, GraduationCapIcon, ShieldCheckIcon, BookOpenIcon, GlobeIcon } from "lucide-react";
import { login } from "@/pages/auth/core/_requests";
import { useRole } from "@/contexts/RoleContext";

const LoginPage = () => {
  const navigate = useNavigate();
  const { setCurrentUser } = useRole();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const res = await login(email, password);
      if (!res || !res.user || !res.token || !res.user.role) {
        setError("Invalid credentials");
        setIsSubmitting(false);
        return;
      }
      // Save token/user as needed
      localStorage.setItem("auth_token", res.token);
      setCurrentUser({ ...res.user, id: String(res.user.id), permissions: res.permissions || [] });
      navigate('/dashboard');
    } catch (err: any) {
      let msg = "Login failed. Please try again.";
      if (err?.response?.status === 401) {
        msg = "Invalid credentials";
      } else if (err?.response?.data?.message) {
        msg = err.response.data.message;
      } else if (err?.message) {
        msg = err.message;
      }
      setError(msg);
      // Do not set user or navigate on error
      console.error("Login error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side - Branding */}
      <div 
        className="flex items-center justify-center w-full lg:w-1/2 pt-15 px-10 relative"
        style={{
          background: `linear-gradient(135deg, #010162 0%, #000140 50%, #010162 100%)`,
        }}
      >
        {/* Background patterns for quality assurance theme */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10">
            <GraduationCapIcon size={60} className="text-white" />
          </div>
          <div className="absolute top-20 right-20">
            <BookOpenIcon size={50} className="text-orange-300" />
          </div>
          <div className="absolute bottom-20 left-20">
            <ShieldCheckIcon size={55} className="text-white" />
          </div>
          <div className="absolute bottom-10 right-10">
            <GraduationCapIcon size={40} className="text-orange-300" />
          </div>
          
          {/* Geometric patterns */}
          <div className="absolute top-1/4 left-1/4 w-24 h-24 rounded-full bg-white opacity-5"></div>
          <div className="absolute bottom-1/4 right-1/4 w-32 h-32 rounded-full opacity-10" style={{ backgroundColor: "#F89B0C" }}></div>
          
          {/* Grid pattern overlay */}
          <div 
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: `linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)`,
              backgroundSize: '40px 40px'
            }}
          ></div>
        </div>

        {/* Content */}
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left relative z-10 max-w-lg">
          {/* Logo */}
          <a href="/" className="mb-7">
            <div className="flex items-center space-x-3">
              <div 
                className="flex items-center justify-center w-16 h-16 rounded-lg shadow-lg"
                style={{ backgroundColor: "#F89B0C" }}
              >
                <GraduationCapIcon className="w-8 h-8 text-white" />
              </div>
              <div className="text-white">
                <h1 className="text-2xl font-bold">UQAMIS</h1>
                <p className="text-sm opacity-80">Optimum</p>
              </div>
            </div>
          </a>
          
          {/* Title */}
          <h2 className="text-white font-normal text-3xl lg:text-4xl mb-4 leading-tight">
            Quality Assurance Management
          </h2>
          <p className="text-white/80 text-lg mb-8">
            Streamlined tools designed for educational excellence
          </p>

          {/* Feature Highlights */}
          <div className="space-y-4 w-full">
            <div className="flex items-center space-x-3 text-white/90">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm">
                <ShieldCheckIcon className="w-5 h-5" style={{ color: "#F89B0C" }} />
              </div>
              <span className="text-sm font-medium">Comprehensive Assessment Tools</span>
            </div>
            
            <div className="flex items-center space-x-3 text-white/90">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm">
                <BookOpenIcon className="w-5 h-5" style={{ color: "#F89B0C" }} />
              </div>
              <span className="text-sm font-medium">Educational Standards Compliance</span>
            </div>
            
            <div className="flex items-center space-x-3 text-white/90">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm">
                <GlobeIcon className="w-5 h-5" style={{ color: "#F89B0C" }} />
              </div>
              <span className="text-sm font-medium">Infrastructure Maintenance</span>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-3 gap-4 mt-8 w-full">
            <div className="text-center">
              <div className="text-2xl font-bold text-white" style={{ color: "#F89B0C" }}>50+</div>
              <div className="text-xs text-white/70">Institutions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white" style={{ color: "#F89B0C" }}>25+</div>
              <div className="text-xs text-white/70">Counties</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white" style={{ color: "#F89B0C" }}>99%</div>
              <div className="text-xs text-white/70">Uptime</div>
            </div>
          </div>

          {/* Call to action badge */}
          <div className="mt-6 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
            <div className="flex items-center space-x-2 text-white/90">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
              <span className="text-xs font-medium">Trusted by leading educational institutions</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex items-center justify-center w-full lg:w-1/2 p-6 lg:p-20 bg-gray-50">
        {/* Card */}
        <Card className="bg-white w-full max-w-md lg:max-w-lg shadow-xl border-0 rounded-lg">
          <CardContent className="p-6 lg:p-10">
            {/* Form */}
            <form className="w-full" onSubmit={handleSubmit}>
              {error && (
                <div className="mb-4 text-red-600 text-center text-sm font-medium">{error}</div>
              )}
              {/* Heading */}
              <div className="text-center mb-11">
                <h1 className="text-gray-900 font-bold text-3xl mb-3">Sign In</h1>
                <div className="text-gray-500 font-semibold text-base">Access Your Quality Assurance Dashboard</div>
              </div>

              {/* Separator */}
              <div className="flex items-center my-8">
                <div className="flex-1 border-t border-gray-300"></div>
                <span className="px-4 text-gray-500 font-semibold text-sm">Sign in with email</span>
                <div className="flex-1 border-t border-gray-300"></div>
              </div>

              {/* Email Input */}
              <div className="mb-6">
                <Input
                  type="email"
                  placeholder="Email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-transparent border-gray-300 h-12 text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  required
                />
              </div>

              {/* Password Input */}
              <div className="mb-3">
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-transparent border-gray-300 h-12 text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-200 pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
                  </button>
                </div>
              </div>

              {/* Forgot Password */}
              <div className="flex justify-end mb-8">
                <button
                  type="button"
                  className="text-sm font-medium hover:underline"
                  style={{ color: "#F89B0C" }}
                >
                  Forgot Password?
                </button>
              </div>

              {/* Submit button */}
              <div className="mb-10">
                <Button
                  type="submit"
                  className="w-full h-12 font-medium text-white transition-all duration-200 hover:shadow-lg flex items-center justify-center"
                  style={{ backgroundColor: "#010162" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#000140";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#010162";
                  }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                      </svg>
                      Logging in...
                    </>
                  ) : (
                    <span>Sign In</span>
                  )}
                </Button>
              </div>
            </form>

            {/* Footer */}
            <div className="flex justify-between mt-10 pt-6 border-t border-gray-200">
              {/* Languages */}
              {/* <div className="flex items-center">
                <Button variant="ghost" className="flex items-center text-gray-700 text-sm p-0">
                  <img 
                    src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjMDA1MkZGIi8+CjxyZWN0IHk9IjEzLjMzMzMiIHdpZHRoPSIyMCIgaGVpZ2h0PSI2LjY2NjY3IiBmaWxsPSIjRkYwMDAwIi8+CjxyZWN0IHk9IjYuNjY2NjciIHdpZHRoPSIyMCIgaGVpZ2h0PSI2LjY2NjY3IiBmaWxsPSIjRkZGRkZGIi8+Cjwvc3ZnPgo="
                    alt="English"
                    className="w-5 h-5 rounded mr-2"
                  />
                  <span className="mr-1">English</span>
                  <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Button>
              </div> */}

              {/* Links */}
              <div className="flex space-x-5 text-sm font-semibold">
                <button className="hover:underline" style={{ color: "#010162" }}>
                  Terms
                </button>
                <button className="hover:underline" style={{ color: "#010162" }}>
                  Plans
                </button>
                <button className="hover:underline" style={{ color: "#010162" }}>
                  Contact Us
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
