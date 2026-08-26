"use client";
import React, { useState } from "react";
import { useFormik } from "formik";
import * as yup from "yup";

export default function Home() {
  const [show, setShow] = useState(false);
  const [rem, setRem] = useState(false);
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const schema = yup.object({
    email: yup.string().required("Email or phone is required"),
    password: yup.string().min(8, "Password should be of minimum 8 characters length").required("Password is required"),
  });

  const f = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema: schema,
    onSubmit: async (v, { setSubmitting }) => {
      setOk(null);
      setErr(null);
      try {
        await new Promise((r) => setTimeout(r, 1500));
        setOk("Welcome back to PadiPay Admin!");
        console.log("Logged in:", { ...v, rem });
      } catch {
        setErr("Login failed. Please check your credentials.");
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="w-screen h-screen overflow-hidden flex items-center justify-center font-satoshi px-4">
      <div className="bg-white rounded-2xl border border-[#E1E4EA] shadow-xl max-w-md w-full p-8 md:p-10 flex flex-col">
        <div className="mb-8 flex justify-start">
          <img src="/logo.png" alt="PadiPay Logo" className="h-7 w-auto object-contain" />
        </div>

        <div className="mb-8 text-left">
          {/* <h3 className="text-[22px] font-semibold text-[#181B25] tracking-tight">Welcome back 👋</h3> */}
          <p className="text-[16px] font-medium text-[#525866] mt-1 tracking-tight">Enter your details to login</p>
        </div>

        {ok && <div className="mb-6 p-4 text-sm text-[#2e7d32] bg-[#edf7ed] rounded-lg border border-[#c3e6cb] text-left">{ok}</div>}
        {err && <div className="mb-6 p-4 text-sm text-[#d32f2f] bg-[#fdeded] rounded-lg border border-[#f5c6cb] text-left">{err}</div>}

        <form onSubmit={f.handleSubmit} className="flex flex-col gap-5 w-full">
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-sm font-medium text-[#525866] text-left">Email or Phone</label>
            <div className={`flex items-center border rounded-lg transition-all bg-white ${f.touched.email && f.errors.email ? "border-red-500 focus-within:ring-2 focus-within:ring-red-100" : "border-[#E1E4EA] focus-within:border-[#68123D] focus-within:ring-2 focus-within:ring-[#68123D]/10"}`}>
              <input type="text" name="email" placeholder="Email or Phone" autoComplete="email" value={f.values.email} onChange={f.handleChange} onBlur={f.handleBlur} className="w-full px-3.5 py-3 text-base text-[#181B25] rounded-lg outline-none bg-transparent" />
            </div>
            {f.touched.email && f.errors.email && <span className="text-xs text-red-500 text-left mt-0.5">{f.errors.email}</span>}
          </div>

          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-sm font-medium text-[#525866] text-left">Password</label>
            <div className={`relative flex items-center border rounded-lg transition-all bg-white ${f.touched.password && f.errors.password ? "border-red-500 focus-within:ring-2 focus-within:ring-red-100" : "border-[#E1E4EA] focus-within:border-[#68123D] focus-within:ring-2 focus-within:ring-[#68123D]/10"}`}>
              <input type={show ? "text" : "password"} name="password" placeholder="Enter password" autoComplete="current-password" value={f.values.password} onChange={f.handleChange} onBlur={f.handleBlur} className="w-full pl-3.5 pr-11 py-3 text-base text-[#181B25] rounded-lg outline-none bg-transparent" />
              <button type="button" className="absolute right-4 text-[#8A94A6] hover:text-[#525866] transition-colors focus:outline-none cursor-pointer" onClick={() => setShow(!show)}>
                {show ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                )}
              </button>
            </div>
            {f.touched.password && f.errors.password && <span className="text-xs text-red-500 text-left mt-0.5">{f.errors.password}</span>}
          </div>

          <div className="flex items-center justify-between mt-1">
            <a href="#" className="text-sm font-medium text-[#181B25] hover:underline" onClick={(e) => e.preventDefault()}>Forgot your password?</a>
          </div>

          <button type="submit" disabled={f.isSubmitting || !f.isValid} className={`w-full mt-4 py-3 px-6 font-medium text-base rounded-full inline-flex items-center justify-center gap-2 text-white transition-all duration-200 ${f.isSubmitting || !f.isValid ? "bg-[#F6F8FA] text-[#B0B6C3] cursor-not-allowed" : "bg-[#68123D] hover:bg-[#520e32] active:scale-[0.98] cursor-pointer"}`}>
            {f.isSubmitting ? <span className="w-[18px] h-[18px] border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : "Log In"}
          </button>
        </form>
      </div>
    </div>
  );
}
