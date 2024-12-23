"use client";
import Link from "next/link";
import { useState } from "react";
import { useActionState } from "react";
import { registerUser } from "@/app/lib/actions";
import QRCodeDisplay from "./qr-code-display";
import { lusitana } from "@/app/ui/fonts";
import { Button } from "./button";
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
// import { useRouter } from "next/router";

export default function RegisterForm() {
  //   const router = useRouter();
  //   const [qrCode, setQrCode] = useState<string | null>(null);
  const [qrCode, formAction, isPending] = useActionState(
    registerUser,
    undefined
  );

  //   const handleSubmit = async (e) => {
  //     e.preventDefault();
  //     const formData = new FormData(e.target);
  //     const response = await formAction(formData);

  //     if (response?.qrCode) {
  //       setQrCode(response.qrCode);
  //     } else {
  //       alert("Registration failed");
  //     }
  //   };

  //   const handleFormAction = async (formData: FormData) => {
  //     const response = await registerUser(formData);
  //     if (response?.qrCode) {
  //       router.push({
  //         pathname: "/register/auth",
  //         query: { qrCode: response.qrCode },
  //       });
  //     } else {
  //       alert("Registration failed");
  //     }
  //   };

  return (
    <div>
      <form action={formAction} className="space-y-3">
        <div className="flex-1 rounded-lg bg-gray-50 px-6 pb-4 pt-8">
          <h1 className={`${lusitana.className} mb-3 text-2xl`}>
            Please register to continue.
          </h1>
          <div className="w-full">
            <div>
              <label
                className="mb-3 mt-5 block text-xs font-medium text-gray-900"
                htmlFor="name"
              >
                Name
              </label>
              <div className="relative">
                <input
                  className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
                  id="name"
                  type="text"
                  name="name"
                  placeholder="Enter your name"
                  required
                />
              </div>
            </div>
          </div>
          <div className="w-full">
            <div>
              <label
                className="mb-3 mt-5 block text-xs font-medium text-gray-900"
                htmlFor="email"
              >
                Email
              </label>
              <div className="relative">
                <input
                  className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
                  id="email"
                  type="email"
                  name="email"
                  placeholder="Enter your email address"
                  required
                />
              </div>
            </div>
            <div className="mt-4">
              <label
                className="mb-3 mt-5 block text-xs font-medium text-gray-900"
                htmlFor="password"
              >
                Password
              </label>
              <div className="relative">
                <input
                  className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
                  id="password"
                  type="password"
                  name="password"
                  placeholder="Enter password"
                  required
                  minLength={6}
                />
              </div>
            </div>
          </div>
          <Button className="mt-4 w-full">
            Register <ArrowRightIcon className="ml-auto h-5 w-5 text-gray-50" />
          </Button>
          <div
            className="flex h-8 items-end space-x-1"
            aria-live="polite"
            aria-atomic="true"
          >
            {/* {errorMessage && (
              <>
                <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
                <p className="text-sm text-red-500">{errorMessage}</p>
              </>
            )} */}
          </div>
        </div>
      </form>
      {qrCode && (
        <>
          <h2 className="text-lg font-semibold text-gray-900 mt-6">
            Enable Two-Factor Authentication
          </h2>
          <div className="mt-4">
            <p className="mb-4 text-sm text-gray-700">
              Scan the image below with the authenticator app on your phone or
              manually enter the text code instead.
            </p>
            <div className="flex justify-center">
              <img src={qrCode} alt="QR Code for two-factor authentication" />
            </div>
          </div>
          <Link
            href="/dashboard"
            className="flex items-center gap-5 self-start rounded-lg bg-blue-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-400 md:text-base"
          >
            <span>Continue</span> <ArrowRightIcon className="w-5 md:w-6" />
          </Link>
        </>
      )}
    </div>
  );
}
