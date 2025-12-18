// Profile section showing account details.
"use client";

import { useState, useEffect } from "react";
// TODO: Re-enable backend fetching after testing
// import { profileApi, type UpdateProfileData, type ChangePasswordData } from "@/lib/api/profile";
import type { UpdateProfileData, ChangePasswordData } from "@/lib/api/profile";
import { mockUser } from "@/lib/data/mockProfile";
// import { useAuthStore } from "@/store/auth-store";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  updateProfileSchema,
  changePasswordSchema,
} from "@/lib/validations/profile.schemas";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Alert, AlertDescription } from "../ui/alert";
// import { LoadingSpinner } from "../ui/loading-spinner";

export function ProfileAccountDetails() {
  // TODO: Re-enable backend fetching after testing
  // const { user, checkAuth } = useAuthStore();
  const user = mockUser;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UpdateProfileData>({
    resolver: yupResolver(updateProfileSchema) as any,
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
    },
  });

  // Initialize form with mock user data
  useEffect(() => {
    if (user) {
      reset({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      });
    }
  }, [user, reset]);

  // TODO: Re-enable backend fetching after testing
  // useEffect(() => {
  //   if (user) {
  //     reset({
  //       firstName: user.firstName,
  //       lastName: user.lastName,
  //       email: user.email,
  //     });
  //   }
  // }, [user, reset]);

  const onSubmit = async (data: UpdateProfileData) => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(false);

      // TODO: Re-enable backend fetching after testing
      // await profileApi.updateProfile(data);
      // await checkAuth(); // Refresh user data

      // Mock update - just simulate success
      await new Promise((resolve) => setTimeout(resolve, 500));

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Failed to update profile. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // TODO: Re-enable backend fetching after testing
  // if (!user) {
  //   return (
  //     <div className="flex items-center justify-center py-12">
  //       <LoadingSpinner />
  //     </div>
  //   );
  // }

  // Password form
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm<ChangePasswordData>({
    resolver: yupResolver(changePasswordSchema) as any,
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const onPasswordSubmit = async (data: ChangePasswordData) => {
    try {
      setIsPasswordLoading(true);
      setPasswordError(null);
      setPasswordSuccess(false);

      // TODO: Re-enable backend fetching after testing
      // await profileApi.changePassword({
      //   currentPassword: data.currentPassword,
      //   newPassword: data.newPassword,
      // });

      // Mock password update - just simulate success
      await new Promise((resolve) => setTimeout(resolve, 500));

      setPasswordSuccess(true);
      resetPassword();
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err: any) {
      setPasswordError(
        err.response?.data?.message ||
          "Failed to change password. Please try again."
      );
    } finally {
      setIsPasswordLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Profile Details Section */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Account Details
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-green-50 text-green-800 border-green-200">
              <AlertDescription>Profile updated successfully!</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="First Name *"
              {...register("firstName")}
              error={errors.firstName?.message}
            />

            <Input
              label="Last Name *"
              {...register("lastName")}
              error={errors.lastName?.message}
            />
          </div>

          <Input
            label="Email *"
            type="email"
            {...register("email")}
            error={errors.email?.message}
          />

          <div className="pt-4">
            <Button type="submit" isLoading={isLoading} size="lg">
              Update Profile
            </Button>
          </div>
        </form>
      </div>

      {/* Change Password Section */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Change Password
        </h2>

        <form
          onSubmit={handleSubmitPassword(onPasswordSubmit)}
          className="space-y-4"
        >
          {passwordError && (
            <Alert variant="destructive">
              <AlertDescription>{passwordError}</AlertDescription>
            </Alert>
          )}

          {passwordSuccess && (
            <Alert className="bg-green-50 text-green-800 border-green-200">
              <AlertDescription>
                Password changed successfully!
              </AlertDescription>
            </Alert>
          )}

          <Input
            label="Current Password *"
            type="password"
            {...registerPassword("currentPassword")}
            error={passwordErrors.currentPassword?.message}
          />

          <Input
            label="New Password *"
            type="password"
            {...registerPassword("newPassword")}
            error={passwordErrors.newPassword?.message}
          />

          <Input
            label="Confirm New Password *"
            type="password"
            {...registerPassword("confirmPassword")}
            error={passwordErrors.confirmPassword?.message}
          />

          <div className="pt-4">
            <Button type="submit" isLoading={isPasswordLoading} size="lg">
              Change Password
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
